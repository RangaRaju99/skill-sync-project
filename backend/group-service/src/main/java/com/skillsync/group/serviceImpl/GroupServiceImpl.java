package com.skillsync.group.serviceImpl;

import com.skillsync.group.dto.request.CreateGroupRequestDto;
import com.skillsync.group.dto.response.GroupResponseDto;
import com.skillsync.group.entity.Group;
import com.skillsync.group.entity.GroupMember;
import com.skillsync.group.entity.MemberRole;
import com.skillsync.group.exception.AlreadyMemberException;
import com.skillsync.group.exception.GroupFullException;
import com.skillsync.group.exception.GroupNotFoundException;
import com.skillsync.group.mapper.GroupMapper;
import com.skillsync.group.repository.GroupMemberRepository;
import com.skillsync.group.repository.GroupRepository;
import com.skillsync.group.service.GroupService;
import com.skillsync.group.client.SkillServiceClient;
import com.skillsync.group.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@CacheConfig(cacheNames = "group")
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupMapper groupMapper;
    private final SkillServiceClient skillServiceClient;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto createGroup(Long creatorId, CreateGroupRequestDto request) {
        log.info("Creating group '{}' with skill {} by creator {}",
                request.getName(), request.getSkillId(), creatorId);

        // Cross-service validation: Skill Sync
        try {
            skillServiceClient.getSkillById(request.getSkillId());
        } catch (Exception e) {
            log.error("Failed to validate skill {}: {}", request.getSkillId(), e.getMessage());
            throw new GroupNotFoundException("Referenced skill (ID: " + request.getSkillId() + ") does not exist or skill-service is down. Cause: " + e.getMessage());
        }

        // Cross-service validation: User Sync
        try {
            userServiceClient.getProfile(creatorId);
        } catch (Exception e) {
            log.error("Failed to validate user {}: {}", creatorId, e.getMessage());
            throw new GroupNotFoundException("Creator user (ID: " + creatorId + ") does not exist or user-service is down. Cause: " + e.getMessage());
        }

        Group group = groupMapper.toEntity(creatorId, request);
        Group savedGroup = groupRepository.save(group);
        groupMemberRepository.save(groupMapper.toMemberEntity(savedGroup.getId(), creatorId, MemberRole.CREATOR));
        log.info("Group {} created with ID {}", request.getName(), savedGroup.getId());
        return groupMapper.toDto(savedGroup, 1);
    }

    @Override
    @Cacheable(key = "#groupId")
    public GroupResponseDto getGroupDetails(Long groupId) {
        log.info("Cache MISS - fetching groupId={} from DB", groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found with ID: " + groupId));
        return groupMapper.toDto(group, groupMemberRepository.countByGroupId(groupId));
    }

    @Override
    @Cacheable(key = "'skill_' + #skillId")
    public List<GroupResponseDto> getGroupsBySkill(Long skillId) {
        log.info("Cache MISS - fetching groups for skillId={} from DB", skillId);
        return groupRepository.findBySkillId(skillId).stream()
                .map(g -> groupMapper.toDto(g, groupMemberRepository.countByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(key = "'creator_' + #creatorId")
    public List<GroupResponseDto> getGroupsByCreator(Long creatorId) {
        log.info("Cache MISS - fetching groups for creatorId={} from DB", creatorId);
        return groupRepository.findByCreatorId(creatorId).stream()
                .map(g -> groupMapper.toDto(g, groupMemberRepository.countByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto joinGroup(Long groupId, Long userId) {
        log.info("User {} joining group {}", userId, groupId);

        // Cross-service validation: User Sync
        try {
            userServiceClient.getProfile(userId);
        } catch (Exception e) {
            log.error("Failed to validate user {} for joining group {}: {}", userId, groupId, e.getMessage());
            throw new GroupNotFoundException("User (ID: " + userId + ") does not exist or user-service is down. Cause: " + e.getMessage());
        }

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        // 🧠 RULE 1: Block Join if ARCHIVED
        if ("ARCHIVED".equalsIgnoreCase(group.getStatus())) {
            throw new RuntimeException("Operational lockout: This community hub is archived and does not accept new synchronizations.");
        }

        // 🧠 RULE 2: Block Join if User has previously left (Shadow Ban Registry)
        if (group.getExitedUserIds().contains(userId)) {
            throw new RuntimeException("Access Denied: Re-entry is restricted for members who have previously disengaged from this hub.");
        }

        Optional<GroupMember> existing = groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
        if (existing.isPresent()) {
            throw new AlreadyMemberException("User is already a member of this group");
        }

        Integer currentMembers = groupMemberRepository.countByGroupId(groupId);
        if (currentMembers >= group.getMaxMembers()) {
            throw new GroupFullException("Group has reached maximum member capacity");
        }

        groupMemberRepository.save(groupMapper.toMemberEntity(groupId, userId, MemberRole.MEMBER));
        log.info("User {} joined group {}", userId, groupId);
        return groupMapper.toDto(group, currentMembers + 1, userId);
    }

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto leaveGroup(Long groupId, Long userId) {
        log.info("User {} leaving group {}", userId, groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));
        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new GroupNotFoundException("User is not a member of this group"));

        // 🧠 RULE 3: On Leave, record user in Exited Registry (Permanent Block)
        group.getExitedUserIds().add(userId);
        groupRepository.save(group);

        groupMemberRepository.delete(member);
        Integer memberCount = groupMemberRepository.countByGroupId(groupId);
        log.info("User {} left group {} and was added to the shadow-ban registry", userId, groupId);
        return groupMapper.toDto(group, memberCount, userId);
    }

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto deleteGroup(Long groupId, Long creatorId) {
        log.info("Deleting group {} by creator {}", groupId, creatorId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));
        if (!group.getCreatorId().equals(creatorId)) {
            throw new GroupNotFoundException("Access Denied: Only the original creator can disband this community.");
        }
        
        group.setStatus("ARCHIVED"); // Deletion is now soft-archival for history preservation
        Group updated = groupRepository.save(group);
        
        // Members are preserved in archival for READ-ONLY mode, but listed count might change
        log.info("Group {} transitioned to ARCHIVED status", groupId);
        return groupMapper.toDto(updated, groupMemberRepository.countByGroupId(groupId), creatorId);
    }

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto updateGroupStatus(Long groupId, Long creatorId, String status) {
        log.info("Updating status of group {} to {} by {}", groupId, status, creatorId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));
        
        if (!group.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized: Admin privileges required to modify community lifecycle.");
        }

        if (!"ACTIVE".equalsIgnoreCase(status) && !"ARCHIVED".equalsIgnoreCase(status)) {
            throw new RuntimeException("Invalid Protocol: Status must be ACTIVE or ARCHIVED.");
        }

        group.setStatus(status.toUpperCase());
        Group saved = groupRepository.save(group);
        return groupMapper.toDto(saved, groupMemberRepository.countByGroupId(groupId), creatorId);
    }

    @Override
    @Transactional
    @CacheEvict(allEntries = true)
    public GroupResponseDto removeMember(Long groupId, Long creatorId, Long memberId) {
        log.info("Creator {} removing member {} from group {}", creatorId, memberId, groupId);
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        if (!group.getCreatorId().equals(creatorId)) {
            throw new RuntimeException("Unauthorized: Only hub creators can eject members.");
        }

        GroupMember member = groupMemberRepository.findByGroupIdAndUserId(groupId, memberId)
                .orElseThrow(() -> new GroupNotFoundException("Target user is not a member of this hub."));

        // 🧠 RULE 4: Admin removal also triggers Shadow Ban
        group.getExitedUserIds().add(memberId);
        groupRepository.save(group);

        groupMemberRepository.delete(member);
        log.info("Member {} purged from hub {} by admin", memberId, groupId);
        return groupMapper.toDto(group, groupMemberRepository.countByGroupId(groupId), creatorId);
    }
}
