package com.agromag.finca.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
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

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lote_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "imagen", "finca", "cultivo"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Lote lote;
}