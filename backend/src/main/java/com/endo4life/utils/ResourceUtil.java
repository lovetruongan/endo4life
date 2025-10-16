package com.endo4life.utils;

import java.io.IOException;
import com.endo4life.web.rest.model.ResourceType;
import jakarta.ws.rs.BadRequestException;
import jdk.jfr.Description;
import lombok.SneakyThrows;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import com.endo4life.constant.Constants;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.Java2DFrameConverter;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Objects;

@UtilityClass
@Slf4j
public class ResourceUtil {

    @Description("Only use when create and upload resource")
    public static ResourceType verifyResourceType(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        return verifyResourceType(fileName);
    }

    @Description("Only use when create and upload resource")
    public static ResourceType verifyResourceType(String fileName) {
        if (Objects.isNull(fileName)) {
            throw new BadRequestException("Invalid resource extension type.");
        }
        if (Constants.VIDEO_EXTENSIONS.contains(FileUtil.getFileExtension(fileName))) {
            return ResourceType.VIDEO;
        } else if (Constants.IMAGE_EXTENSIONS.contains(FileUtil.getFileExtension(fileName))) {
            return ResourceType.IMAGE;
        } else {
            throw new BadRequestException("This resource extension is not supported.");
        }
    }

    @Description("Get dimensions of an image")
    public String getDimensions(MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            BufferedImage bufferedImage = ImageIO.read(inputStream);
            if (bufferedImage != null) {
                return bufferedImage.getWidth() + " x " + bufferedImage.getHeight();
            } else {
                log.error("Could not read the image: unsupported image format");
            }
        } catch (Exception e) {
            log.error("Could not get dimensions of the image: {}", e.getMessage(), e);
        }
        return null;
    }

    @Description("Get dimensions of a video")
    public String getDimensions(MultipartFile file, ResourceType type) {
        try {
            if (type == ResourceType.IMAGE) {
                return getDimensions(file);
            }
            FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(file.getInputStream());
            grabber.start();
            int width = grabber.getImageWidth();
            int height = grabber.getImageHeight();
            grabber.stop();
            return width + " x " + height;
        } catch (IOException e) {
            log.info("Could not get dimensions of video {}", e.getMessage());
        }
        return null;
    }

    public String getSize(MultipartFile file) {
        return file.getSize() / (1024.0 * 1024.0) + " " + Constants.UNIT_MB;
    }

    @SneakyThrows
    public byte[] generateThumbnail(MultipartFile originalImage, String imageDimension) {
        int width = Integer.parseInt(imageDimension.split("x")[0]);
        int height = Integer.parseInt(imageDimension.split("x")[1]);

        try (InputStream inputStream = originalImage.getInputStream();
                ByteArrayOutputStream thumbnailOutputStream = new ByteArrayOutputStream()) {

            BufferedImage originalBufferedImage = ImageIO.read(inputStream);

            if (originalBufferedImage == null) {
                throw new IOException("Invalid image format.");
            }
            Thumbnails.of(originalBufferedImage)
                    .size(width, height)
                    .outputFormat("png")
                    .toOutputStream(thumbnailOutputStream);

            return thumbnailOutputStream.toByteArray();
        } catch (IOException e) {
            throw new IOException("Error generating thumbnail: " + e.getMessage(), e);
        }
    }

    @SneakyThrows
    public byte[] getFirstFrame(MultipartFile video) {
        InputStream inputStream = video.getInputStream();
        return getFirstFrame(inputStream);
    }

    @SneakyThrows
    public byte[] getFirstFrame(InputStream stream) {
        FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(stream);
        Java2DFrameConverter converter = new Java2DFrameConverter();

        grabber.start();
        BufferedImage bufferedImage = null;
        
        // Try to grab the first valid frame
        for (int i = 0; i < 100; i++) { // Try first 100 frames
            var frame = grabber.grab();
            if (frame != null && frame.image != null) {
                bufferedImage = converter.convert(frame);
                break;
            }
        }
        
        grabber.stop();
        if (bufferedImage != null) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", baos);
            return baos.toByteArray();
        } else {
            log.error("Failed to extract the first frame.");
            return new byte[0];
        }
    }
}
