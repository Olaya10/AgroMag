package com.agromag.finca.controllers;

import com.agromag.finca.entities.Novedad;
import com.agromag.finca.repositories.NovedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/novedades")
public class NovedadController {

    @Autowired
    private NovedadRepository novedadRepository;

    @PostMapping
    public Novedad registrar(@RequestBody Novedad novedad) {
        novedad.setFecha(LocalDateTime.now());
        return novedadRepository.save(novedad);
    }

    @GetMapping("/lote/{loteId}")
    public List<Novedad> listarPorLote(@PathVariable Long loteId) {
        return novedadRepository.findByLoteId(loteId);
    }
}