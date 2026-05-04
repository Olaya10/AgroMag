package com.AgroMag.auth_service.dto;

public class UserDTO {
    private Long id;
    private String name;
    private Integer cedula;
    private Integer edad;
    private String email;
    private String role;
    private Boolean active;

    // Constructor vacío
    public UserDTO() {
    }

    public UserDTO(Long id, String name, Integer cedula, Integer edad, String email, String role, Boolean active) {
        this.id = id;
        this.name = name;
        this.cedula = cedula;
        this.edad = edad;
        this.email = email;
        this.role = role;
        this.active = active;
    }

    // Getters y Setters
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