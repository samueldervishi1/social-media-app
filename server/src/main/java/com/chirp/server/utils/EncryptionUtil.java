package com.chirp.server.utils;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Component
public class EncryptionUtil {

	private static final String ALGORITHM = "AES";
	private SecretKey secretKey;

	@Value("${encryption.key}")
	private String encryptionKey;

	@PostConstruct
	public void init() {
		if (encryptionKey == null || encryptionKey.length() != 32) {
			throw new IllegalArgumentException(
					"Encryption key must be 32 characters long. Provided key length: " +
							(encryptionKey == null ? "null" : encryptionKey.length())
			);
		}
		secretKey = new SecretKeySpec(encryptionKey.getBytes() , ALGORITHM);
	}

	public String encrypt(String data) {
		try {
			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(Cipher.ENCRYPT_MODE , secretKey);
			byte[] encryptedData = cipher.doFinal(data.getBytes());
			return Base64.getEncoder().encodeToString(encryptedData);
		} catch (Exception e) {
			throw new RuntimeException("Error while encrypting data" , e);
		}
	}

	public String decrypt(String encryptedData) {
		try {
			Cipher cipher = Cipher.getInstance(ALGORITHM);
			cipher.init(Cipher.DECRYPT_MODE , secretKey);
			byte[] decryptedData = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
			return new String(decryptedData);
		} catch (Exception e) {
			throw new RuntimeException("Error while decrypting data" , e);
		}
	}
}