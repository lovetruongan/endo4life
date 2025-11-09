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
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
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
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int PREVIEW_DPI = 150; // Resolution for preview image

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

        try (PDDocument document = new PDDocument()) {
            // Create a page with landscape orientation (certificate is horizontal)
            PDPage page = new PDPage(PDRectangle.A4);
            page.setRotation(90); // Rotate to landscape
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                // Load and draw the certificate template
                drawTemplate(document, contentStream, page);

                // Add user name
                String userName = formatUserName(user);
                drawCenteredText(contentStream, userName, 420, 36, new Standard14Fonts.FontName[] {
                        Standard14Fonts.FontName.TIMES_BOLD_ITALIC
                }, page);

                // Add course name
                drawCenteredText(contentStream, course.getTitle(), 360, 14, new Standard14Fonts.FontName[] {
                        Standard14Fonts.FontName.TIMES_ROMAN
                }, page);

                // Add issue date (bottom left)
                String dateText = issuedAt.format(DATE_FORMATTER);
                drawLeftAlignedText(contentStream, dateText, 100, 90, 10, new Standard14Fonts.FontName[] {
                        Standard14Fonts.FontName.TIMES_ROMAN
                }, page);

                // Add signature placeholder (bottom right)
                drawRightAlignedText(contentStream, "Administrator", 495, 90, 10, new Standard14Fonts.FontName[] {
                        Standard14Fonts.FontName.TIMES_ROMAN
                }, page);
            }

            // Convert to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);

            log.info("Certificate PDF generated successfully");
            return outputStream.toByteArray();
        }
    }

    private void drawTemplate(PDDocument document, PDPageContentStream contentStream, PDPage page) throws IOException {
        ClassPathResource resource = new ClassPathResource(TEMPLATE_PATH);

        try (InputStream imageStream = resource.getInputStream()) {
            PDImageXObject image = PDImageXObject.createFromByteArray(document, imageStream.readAllBytes(),
                    "certificate");

            // Get page dimensions (rotated to landscape)
            float pageWidth = page.getMediaBox().getHeight(); // Swapped due to rotation
            float pageHeight = page.getMediaBox().getWidth();

            // Draw image to fill the page
            contentStream.drawImage(image, 0, 0, pageWidth, pageHeight);
        }
    }

    private void drawCenteredText(PDPageContentStream contentStream, String text,
            float y, float fontSize,
            Standard14Fonts.FontName[] fontNames, PDPage page) throws IOException {
        PDType1Font font = new PDType1Font(fontNames[0]);
        float textWidth = font.getStringWidth(text) / 1000 * fontSize;
        float pageWidth = page.getMediaBox().getHeight(); // Swapped due to rotation
        float x = (pageWidth - textWidth) / 2;

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void drawLeftAlignedText(PDPageContentStream contentStream, String text,
            float x, float y, float fontSize,
            Standard14Fonts.FontName[] fontNames, PDPage page) throws IOException {
        PDType1Font font = new PDType1Font(fontNames[0]);

        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void drawRightAlignedText(PDPageContentStream contentStream, String text,
            float x, float y, float fontSize,
            Standard14Fonts.FontName[] fontNames, PDPage page) throws IOException {
        PDType1Font font = new PDType1Font(fontNames[0]);
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
