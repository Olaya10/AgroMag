package com.agromag.finca.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "lotes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private Double extensionHectareas;
    private String coordenadas;
    private String etapaDesarrollo;
    private String observaciones;
    
    @Lob
    @Column(columnDefinition = "TEXT")
    private String imagen; // Almacenar imagen en base64
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "finca_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "imagen"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Finca finca;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cultivo_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "imagen"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Cultivo cultivo;
    
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