package com.agromag.finca.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Novedad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descripcion;
    private String fotoUrl;
    private LocalDateTime fecha;

    @ManyToOne
    @JoinColumn(name = "lote_id")
    private Lote lote;
}