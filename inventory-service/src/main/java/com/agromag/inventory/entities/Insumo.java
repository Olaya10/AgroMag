package com.agromag.inventory.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "insumos")
@Data
public class Insumo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombreComercial;
    private String tipo;
    private Double stockActual;
    private Double umbralCritico;
    private String unidadMedida;
}