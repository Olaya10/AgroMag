package com.agromag.finca.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "riegos")
@Data
public class Riego {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fechaHora;
    private Double cantidadAguaLitros;
    private String observaciones;

    @ManyToOne
    @JoinColumn(name = "lote_id")
    private Lote lote;
}