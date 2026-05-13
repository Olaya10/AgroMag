package com.agromag.finca.entities;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import java.time.LocalDateTime;

@Entity
@Table(name = "novedades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Novedad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String descripcion;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String fotoUrl;

    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lote_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "imagen", "observaciones", "coordenadas"})
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Lote lote;
}