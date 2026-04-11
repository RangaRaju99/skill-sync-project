package com.skillsync.chat.service;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.sas.BlobSasPermission;
import com.azure.storage.blob.sas.BlobServiceSasSignatureValues;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class AzureBlobService {

    @Autowired(required = false)
    private BlobContainerClient blobContainerClient;

    // Allowed file types
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of("image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp");
    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of("video/mp4", "video/webm", "video/quicktime");
    private static final Set<String> ALLOWED_DOC_TYPES = Set.of("application/pdf", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");

    // Size limits
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
    private static final long MAX_DOC_SIZE = 10 * 1024 * 1024;    // 10MB

    /**
     * Upload file to Azure Blob Storage and return secure SAS URL.
     *
     * @param file     The multipart file to upload
     * @param groupId  Group ID for folder organization
     * @param messageId Unique identifier for the file
     * @return Secure SAS URL with temporary access
     */
    public String uploadFile(MultipartFile file, Long groupId, String messageId) throws IOException {
        if (blobContainerClient == null) {
            throw new IllegalStateException("Azure Blob Storage is not configured");
        }

        validateFile(file);

        String folder = getFolder(file.getContentType());
        String extension = getExtension(file.getOriginalFilename());
        String blobName = folder + "/" + groupId + "/" + messageId + "." + extension;

        BlobClient blobClient = blobContainerClient.getBlobClient(blobName);
        blobClient.upload(file.getInputStream(), file.getSize(), true);

        log.info("[Chat] File uploaded to Azure Blob: {}", blobName);

        return generateSasUrl(blobClient);
    }

    /**
     * Generate a SAS (Shared Access Signature) URL with 24-hour read access.
     * Cached in Redis for performance.
     */
    @Cacheable(value = "sasTokens", key = "#blobClient.blobName")
    public String generateSasUrl(BlobClient blobClient) {
        log.info("[Chat] Generating fresh SAS token for blob: {}", blobClient.getBlobName());
        BlobSasPermission permission = new BlobSasPermission().setReadPermission(true);
        BlobServiceSasSignatureValues sasValues = new BlobServiceSasSignatureValues(
                OffsetDateTime.now().plusHours(24), permission);

        String sasToken = blobClient.generateSas(sasValues);
        return blobClient.getBlobUrl() + "?" + sasToken;
    }

    /**
     * Regenerate SAS URL from blob name.
     */
    public String generateSasUrlFromBlobName(String blobName) {
        if (blobContainerClient == null) return null;
        BlobClient blobClient = blobContainerClient.getBlobClient(blobName);
        return generateSasUrl(blobClient);
    }

    /**
     * Validate file type and size.
     */
    private void validateFile(MultipartFile file) {
        String contentType = file.getContentType();
        long size = file.getSize();

        if (contentType == null) {
            throw new IllegalArgumentException("File type cannot be determined");
        }

        if (ALLOWED_IMAGE_TYPES.contains(contentType)) {
            if (size > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image size must be less than 5MB");
            }
        } else if (ALLOWED_VIDEO_TYPES.contains(contentType)) {
            if (size > MAX_VIDEO_SIZE) {
                throw new IllegalArgumentException("Video size must be less than 50MB");
            }
        } else if (ALLOWED_DOC_TYPES.contains(contentType)) {
            if (size > MAX_DOC_SIZE) {
                throw new IllegalArgumentException("Document size must be less than 10MB");
            }
        } else {
            throw new IllegalArgumentException("File type not allowed: " + contentType);
        }
    }

    private String getFolder(String contentType) {
        if (ALLOWED_IMAGE_TYPES.contains(contentType)) return "images";
        if (ALLOWED_VIDEO_TYPES.contains(contentType)) return "videos";
        return "documents";
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
