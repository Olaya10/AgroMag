package com.agromag.finca.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fincas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Finca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String ubicacion;
    private Double tamanoHectareas;
    private String descripcion;

    @Lob
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