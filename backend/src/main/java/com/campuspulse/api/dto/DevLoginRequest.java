package com.campuspulse.api.dto;

import jakarta.validation.constraints.NotBlank;

public class DevLoginRequest {
    @NotBlank(message = "Email is required")
    private String email;

    public DevLoginRequest() {}

    public DevLoginRequest(String email) {
        this.email = email;
    }

    public static DevLoginRequestBuilder builder() {
        return new DevLoginRequestBuilder();
    }

    public static class DevLoginRequestBuilder {
        private String email;

        public DevLoginRequestBuilder email(String email) { this.email = email; return this; }

        public DevLoginRequest build() {
            return new DevLoginRequest(email);
        }
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
