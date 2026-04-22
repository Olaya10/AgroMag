package com.agromag.finca.controllers;

import com.agromag.finca.entities.Lote;
import com.agromag.finca.repositories.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/lotes")
public class LoteController {

    @Autowired
    private LoteRepository loteRepository;

    @GetMapping
    public List<Lote> listar() {
        return loteRepository.findAll();
    }

    @PostMapping
    public Lote guardar(@RequestBody Lote lote) {
        return loteRepository.save(lote);
    }

    @PatchMapping("/{id}/etapa")
    public Lote actualizarEtapa(@PathVariable Long id, @RequestBody String nuevaEtapa) {
        Lote lote = loteRepository.findById(id).orElseThrow();
        lote.setEtapaDesarrollo(nuevaEtapa);
        return loteRepository.save(lote);
    }
}