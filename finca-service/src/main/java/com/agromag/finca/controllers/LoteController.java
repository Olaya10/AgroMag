package com.agromag.finca.controllers;

import com.agromag.finca.entities.Lote;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.agromag.finca.services.LoteService;

import java.util.List;

@RestController
@RequestMapping("/lotes")
public class LoteController {

    @Autowired
    private LoteService loteService;

    @GetMapping
    public List<Lote> listar() {
        return loteService.listarPorLote();
    }

    @GetMapping("/finca/{fincaId}")
    public List<Lote> listarPorFinca(@PathVariable Long fincaId) {
        return loteService.listarPorFinca(fincaId);
    }

    @PostMapping
    public ResponseEntity<?> guardar(@RequestBody Lote lote) {
        try {
            return ResponseEntity.ok(loteService.guardar(lote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/etapa")
    public ResponseEntity<?> actualizarEtapa(@PathVariable Long id, @RequestBody String nuevaEtapa) {
        try {
            return ResponseEntity.ok(loteService.actualizarEtapa(id, nuevaEtapa));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Lote lote) {
        try {
            return ResponseEntity.ok(loteService.actualizar(id, lote));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            loteService.eliminarLote(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
