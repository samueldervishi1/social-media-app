package com.chirp.server.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Document
public class User {

	@Id
	private String id;
	private String username;
	private String password;
	private String salt;
	private String fullName;
	private String email;
	private String bio;
	private String title;
	private String role = "simple_account";
	private boolean deleted;
	private boolean twoFa = false;
	private LocalDateTime accountCreationDate;

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		User user = (User) o;
		return Objects.equals(id , user.id);
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getSalt() {
		return salt;
	}

	public void setSalt(String salt) {
		this.salt = salt;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public boolean isDeleted() {
		return deleted;
	}

	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}

	public boolean isTwoFa() {
		return twoFa;
	}

	public void setTwoFa(boolean twoFa) {
		this.twoFa = twoFa;
	}

	public LocalDateTime getAccountCreationDate() {
		return accountCreationDate;
	}

	public void setAccountCreationDate(LocalDateTime accountCreationDate) {
		this.accountCreationDate = accountCreationDate;
	}
}