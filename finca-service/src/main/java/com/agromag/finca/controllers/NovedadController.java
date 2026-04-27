package com.agromag.finca.controllers;

import com.agromag.finca.entities.Novedad;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.agromag.finca.services.NovedadService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/novedades")
public class NovedadController {

    @Autowired
    private NovedadService novedadService;

    @PostMapping
    public Novedad registrar(@RequestBody Novedad novedad) {
        novedad.setFecha(LocalDateTime.now());
        return novedadService.guardar(novedad);
    }

    @GetMapping("/lote/{loteId}")
    public List<Novedad> listarPorLote(@PathVariable Long loteId) {
        return novedadService.listarPorLote(loteId);
    }
}