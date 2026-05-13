package com.AgroMag.auth_service.dto;

public class AuthenticationResponse {
    private String token;
    private Long id;
    private String name;
    private Integer cedula;
    private Integer edad;
    private String email;
    private String role;
    private Boolean active;

    public AuthenticationResponse() {
    }

    public AuthenticationResponse(String token, UserDTO user) {
        this.token = token;
        this.id = user.getId();
        this.name = user.getName();
        this.cedula = user.getCedula();
        this.edad = user.getEdad();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.getActive();
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getCedula() {
        return cedula;
    }

    public void setCedula(Integer cedula) {
        this.cedula = cedula;
    }

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
