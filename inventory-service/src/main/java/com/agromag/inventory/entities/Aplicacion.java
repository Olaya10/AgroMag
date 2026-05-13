package com.agromag.inventory.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "aplicaciones")
@Data
public class Aplicacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long loteId; // Referencia al Finca-Service
    private Long operarioId; // Referencia al Auth-Service
    private Double dosis;
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "insumo_id")
    private Insumo insumo;
}