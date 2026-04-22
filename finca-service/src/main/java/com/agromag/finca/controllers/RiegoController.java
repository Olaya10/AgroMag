package com.agromag.finca.controllers;

import com.agromag.finca.entities.Riego;
import com.agromag.finca.repositories.RiegoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/riegos")
public class RiegoController {

    @Autowired
    private RiegoRepository riegoRepository;

    @PostMapping
    public Riego registrarRiego(@RequestBody Riego riego) {
        return riegoRepository.save(riego);
    }

    @GetMapping
    public List<Riego> listarHistorial() {
        return riegoRepository.findAll();
    }

    @PutMapping("/{id}")
    public Riego actualizarRiego(@PathVariable Long id, @RequestBody Riego riegoDetalles) {
        Riego riego = riegoRepository.findById(id).orElseThrow();
        riego.setCantidadAguaLitros(riegoDetalles.getCantidadAguaLitros());
        riego.setFechaHora(riegoDetalles.getFechaHora());
        riego.setObservaciones(riegoDetalles.getObservaciones());
        return riegoRepository.save(riego);
    }

    @DeleteMapping("/{id}")
    public void eliminarRiego(@PathVariable Long id) {
        riegoRepository.deleteById(id);
    }
}