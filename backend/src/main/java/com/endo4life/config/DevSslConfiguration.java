package com.endo4life.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.cert.X509Certificate;

@Component
@Profile("dev")
@Slf4j
public class DevSslConfiguration {

    @PostConstruct
    public void disableSslVerification() {
        try {
            log.warn("🚨 DEVELOPMENT MODE: Disabling SSL certificate verification");
            log.warn("🚨 DO NOT USE IN PRODUCTION!");

            // Create a trust manager that accepts all certificates
            TrustManager[] trustAllCerts = new TrustManager[] {
                    new X509TrustManager() {
                        public X509Certificate[] getAcceptedIssuers() {
                            return null;
                        }

                        public void checkClientTrusted(X509Certificate[] certs, String authType) {
                        }

                        public void checkServerTrusted(X509Certificate[] certs, String authType) {
                        }
                    }
            };

            // Install the all-trusting trust manager
            SSLContext sc = SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            // Create all-trusting host name verifier
            HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

            log.info("✅ SSL certificate verification disabled for development");
        } catch (Exception e) {
            log.error("❌ Failed to disable SSL verification", e);
        }
    }
}
