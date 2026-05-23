package com.agromag.finca.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cultivos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cultivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private Integer diasCosecha;
    private String temperaturaOptima;
    private String humedadOptima;

    public String getTemperaturaOptima() {
        return temperaturaOptima;
    }

    public void setTemperaturaOptima(String temperaturaOptima) {
        this.temperaturaOptima = temperaturaOptima;
    }

    public String getHumedadOptima() {
        return humedadOptima;
    }

    public void setHumedadOptima(String humedadOptima) {
        this.humedadOptima = humedadOptima;
    }
    
    
    @Column(columnDefinition = "TEXT")
    private String imagen; // Almacenar imagen en base64
    
    private Boolean activo = true;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
        fechaActualizacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
