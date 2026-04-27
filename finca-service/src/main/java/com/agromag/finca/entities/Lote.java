package com.agromag.finca.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "lotes")
@Data
public class Lote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipoCultivo;
    private Double extensionHectareas;
    private String coordenadas;
    private String etapaDesarrollo;
    private String observaciones;
}