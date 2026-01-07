package com.endo4life.service.certificate;

import com.endo4life.domain.document.Course;
import com.endo4life.domain.document.UserInfo;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateGeneratorService {

    private static final String TEMPLATE_PATH = "templates/certificate-template.jpg";
    private static final String FONT_PATH = "fonts/NotoSans-Regular.ttf";
    private static final String FONT_BOLD_PATH = "fonts/NotoSans-Bold.ttf";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int PREVIEW_DPI = 150; // DPI for preview image

    // Certificate dimensions (portrait A4: 595 x 842 points)
    private static final float PAGE_WIDTH = 595f;
    private static final float PAGE_HEIGHT = 842f;

    // Text positions (calibrated for portrait template)
    private static final float USER_NAME_Y = 480f; // Center position for user name
    private static final float COURSE_NAME_Y = 430f; // Position for course name
    private static final float DATE_X = 100f; // Left position for date
    private static final float DATE_Y = 120f;
    private static final float SIGNATURE_X = 495f; // Right position for signature
    private static final float SIGNATURE_Y = 120f;

    /**
     * DTO to hold both PDF and preview image
     */
    @Data
    public static class CertificateFiles {
        private final byte[] pdfBytes;
        private final byte[] previewImageBytes;
    }

    /**
     * Generate both PDF and preview image for certificate
     */
    public CertificateFiles generateCertificateWithPreview(UserInfo user, Course course, LocalDateTime issuedAt)
            throws IOException {
        log.info("Generating certificate PDF and preview for user: {} and course: {}", user.getId(), course.getId());

        byte[] pdfBytes = generateCourseCertificate(user, course, issuedAt);
        byte[] previewBytes = convertPdfToImage(pdfBytes);

        return new CertificateFiles(pdfBytes, previewBytes);
    }

    /**
     * Generate a course completion certificate PDF with user and course information
     */
    public byte[] generateCourseCertificate(UserInfo user, Course course, LocalDateTime issuedAt) throws IOException {
        log.info("Generating certificate PDF for user: {} and course: {}", user.getId(), course.getId());

        // Format user name for certificate
        String userName = formatUserName(user);

        try (PDDocument document = new PDDocument()) {
            // Create portrait A4 page
            PDPage page = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            document.addPage(page);

            // Load fonts that support Vietnamese characters
            PDFont regularFont = loadFont(document, FONT_PATH);
            PDFont boldFont = loadFont(document, FONT_BOLD_PATH);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Draw the certificate template background
                drawTemplate(document, contentStream);

                // Add user name (large, bold, centered)
                drawCenteredText(contentStream, userName, USER_NAME_Y, 32, boldFont);

                // Add course name (medium, centered)
                drawCenteredText(contentStream, course.getTitle(), COURSE_NAME_Y, 16, regularFont);

                // Add issue date (bottom left)
                String dateText = "Ngày cấp: " + issuedAt.format(DATE_FORMATTER);
                drawText(contentStream, dateText, DATE_X, DATE_Y, 11, regularFont);

                // Add signature (bottom right)
                drawRightAlignedText(contentStream, "Quản trị viên", SIGNATURE_X, SIGNATURE_Y, 11, regularFont);
            }

            // Convert to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);

            log.info("Certificate PDF generated successfully for user: {}", userName);
            return outputStream.toByteArray();
        }
    }

    /**
     * Load font that supports Vietnamese characters
     */
    private PDFont loadFont(PDDocument document, String fontPath) throws IOException {
        try {
            ClassPathResource fontResource = new ClassPathResource(fontPath);
            try (InputStream fontStream = fontResource.getInputStream()) {
                return PDType0Font.load(document, fontStream);
            }
        } catch (IOException e) {
            log.warn("Failed to load custom font from {}, using fallback", fontPath, e);
            // Fallback to embedded font if custom font not available
            return PDType0Font.load(document,
                    CertificateGeneratorService.class
                            .getResourceAsStream("/org/apache/pdfbox/resources/ttf/LiberationSans-Regular.ttf"));
        }
    }

    /**
     * Draw certificate template background
     */
    private void drawTemplate(PDDocument document, PDPageContentStream contentStream) throws IOException {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);

        try (InputStream imageStream = resource.getInputStream()) {
            PDImageXObject image = PDImageXObject.createFromByteArray(document, imageStream.readAllBytes(),
                    "certificate-template");

            // Draw image to fill the landscape page
            contentStream.drawImage(image, 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        }
    }

    /**
     * Draw centered text
     */
    private void drawCenteredText(PDPageContentStream contentStream, String text,
            float y, float fontSize, PDFont font) throws IOException {
        float textWidth = font.getStringWidth(text) / 1000 * fontSize;
        float x = (PAGE_WIDTH - textWidth) / 2;

        drawText(contentStream, text, x, y, fontSize, font);
    }

    /**
     * Draw text at specified position
     */
    private void drawText(PDPageContentStream contentStream, String text,
            float x, float y, float fontSize, PDFont font) throws IOException {
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    /**
     * Draw right-aligned text
     */
    private void drawRightAlignedText(PDPageContentStream contentStream, String text,
            float x, float y, float fontSize, PDFont font) throws IOException {
        float textWidth = font.getStringWidth(text) / 1000 * fontSize;

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x - textWidth, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private String formatUserName(UserInfo user) {
        StringBuilder name = new StringBuilder();
        if (user.getFirstName() != null) {
            name.append(user.getFirstName());
        }
        if (user.getLastName() != null) {
            if (name.length() > 0) {
                name.append(" ");
            }
            name.append(user.getLastName());
        }
        return name.toString().toUpperCase();
    }

    /**
     * Convert PDF to PNG image for preview
     */
    public byte[] convertPdfToImage(byte[] pdfBytes) throws IOException {
        log.debug("Converting PDF to preview image");

        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFRenderer renderer = new PDFRenderer(document);

            // Render first page at specified DPI
            BufferedImage image = renderer.renderImageWithDPI(0, PREVIEW_DPI);

            // Convert to PNG bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", outputStream);

            log.debug("Preview image generated successfully");
            return outputStream.toByteArray();
        }
    }
}
