import React, { useState } from 'react';
import { User, Phone, Mail, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import EditableField from './EditableField';
import SkillSelector from './SkillSelector';
import type { Skill } from '@/services/skill.service';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileFormProps {
  formData: {
    username: string;
    firstName: string;
    lastName: string;
    bio: string;
    phoneNumber: string;
    skills: string[];
  };
  email: string;
  isEditing: boolean;
  onFieldChange: (field: string, value: any) => void;
  availableSkills: Skill[];
  skillSearchQuery: string;
  onSkillSearchChange: (query: string) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  email,
  isEditing,
  onFieldChange,
  availableSkills,
  skillSearchQuery,
  onSkillSearchChange,
}) => {
  const [sectionsExpanded, setSectionsExpanded] = useState({
    personal: true,
    contact: true,
    about: true,
    skills: true
  });

  const toggleSection = (section: keyof typeof sectionsExpanded) => {
    setSectionsExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ id, label, isExpanded }: { id: keyof typeof sectionsExpanded, label: string, isExpanded: boolean }) => (
    <div 
      className="flex items-center gap-4 cursor-pointer group py-2" 
      onClick={() => toggleSection(id)}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isExpanded ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground/40'}`}>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all">
        {label}
      </h4>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Personal Information */}
      <div className="space-y-6">
        <SectionHeader id="personal" label="Personal Identity" isExpanded={sectionsExpanded.personal} />
        <AnimatePresence>
          {sectionsExpanded.personal && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <EditableField
                label="Public Username"
                value={formData.username}
                onChange={(val) => onFieldChange('username', val)}
                isEditing={isEditing}
                icon={User}
                placeholder="e.g. johndoe"
              />
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="First Name"
                  value={formData.firstName}
                  onChange={(val) => onFieldChange('firstName', val)}
                  isEditing={isEditing}
                  placeholder="First"
                />
                <EditableField
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(val) => onFieldChange('lastName', val)}
                  isEditing={isEditing}
                  placeholder="Last"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contact Details */}
      <div className="space-y-6">
        <SectionHeader id="contact" label="Contact Connectivity" isExpanded={sectionsExpanded.contact} />
        <AnimatePresence>
          {sectionsExpanded.contact && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <EditableField
                label="Primary Email"
                value={email}
                onChange={() => {}}
                isEditing={isEditing}
                disabled={true}
                icon={Mail}
              />
              <EditableField
                label="Phone Number"
                value={formData.phoneNumber}
                onChange={(val) => onFieldChange('phoneNumber', val)}
                isEditing={isEditing}
                type="tel"
                icon={Phone}
                placeholder="+1 (555) 000-0000"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* About Section */}
      <div className="space-y-6">
        <SectionHeader id="about" label="Professional Brief" isExpanded={sectionsExpanded.about} />
        <AnimatePresence>
          {sectionsExpanded.about && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <EditableField
                label="Biography"
                value={formData.bio}
                onChange={(val) => onFieldChange('bio', val)}
                isEditing={isEditing}
                type="textarea"
                icon={FileText}
                placeholder="Share your journey, expertise, and goals..."
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills Section */}
      <div className="space-y-6">
        <SectionHeader id="skills" label="Technical Stack" isExpanded={sectionsExpanded.skills} />
        <AnimatePresence>
          {sectionsExpanded.skills && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <SkillSelector
                selectedSkills={formData.skills}
                availableSkills={availableSkills}
                isEditing={isEditing}
                onToggleSkill={(skill) => {
                  const newSkills = formData.skills.includes(skill)
                    ? formData.skills.filter(s => s !== skill)
                    : [...formData.skills, skill];
                  onFieldChange('skills', newSkills);
                }}
                searchQuery={skillSearchQuery}
                onSearchChange={onSkillSearchChange}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileForm;
