package com.agromag.finca.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "finca", "cultivo", "riegos"})
    private Lote lote;
}