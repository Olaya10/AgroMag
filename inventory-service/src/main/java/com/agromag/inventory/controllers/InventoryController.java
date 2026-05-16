package com.agromag.inventory.controllers;

import com.agromag.inventory.entities.Insumo;
import com.agromag.inventory.entities.Aplicacion;
import com.agromag.inventory.dto.InsumoDTO;
import com.agromag.inventory.dto.AplicacionDTO;
import com.agromag.inventory.dto.InventoryMapper;
import com.agromag.inventory.repositories.InsumoRepository;
import com.agromag.inventory.services.InsumoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/bodega")
@RequiredArgsConstructor
public class InventoryController {

    private final InsumoRepository insumoRepository;

    private final InsumoService insumoService;

    @PostMapping("/insumos")
    public InsumoDTO crearInsumo(@RequestBody InsumoDTO insumoDTO) {
        Insumo insumo = InventoryMapper.toEntity(insumoDTO);
        return InventoryMapper.toDTO(insumoRepository.save(insumo));
    }

    @GetMapping("/insumos")
    public List<InsumoDTO> listarInsumos() {
        return insumoRepository.findAll().stream()
                .map(InventoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PostMapping("/aplicar")
    public AplicacionDTO registrarAplicacion(@RequestBody AplicacionDTO aplicacionDTO) {
        Aplicacion aplicacion = InventoryMapper.toEntity(aplicacionDTO);
        return InventoryMapper.toDTO(insumoService.registrarAplicacion(aplicacion));
    }

    @GetMapping("/aplicaciones")
    public List<AplicacionDTO> listarAplicaciones() {
        return insumoService.listarAplicaciones().stream()
                .map(InventoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @PutMapping("/aplicaciones/{id}")
    public ResponseEntity<?> actualizarAplicacion(@PathVariable Long id, @RequestBody AplicacionDTO aplicacionDetallesDTO) {
        try {
            Aplicacion aplicacionDetalles = InventoryMapper.toEntity(aplicacionDetallesDTO);
            return ResponseEntity.ok(InventoryMapper.toDTO(insumoService.actualizarAplicacion(id, aplicacionDetalles)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al actualizar la aplicación: " + e.getMessage());
        }
    }

    @DeleteMapping("/aplicaciones/{id}")
    public ResponseEntity<?> eliminarAplicacion(@PathVariable Long id) {
        try {
            insumoService.eliminarAplicacion(id);
            return ResponseEntity.ok("Aplicación eliminada correctamente y stock devuelto a bodega");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al eliminar la aplicación: " + e.getMessage());
        }
    }

    @PutMapping("/insumos/{id}")
    public InsumoDTO actualizarInsumo(@PathVariable Long id, @RequestBody InsumoDTO insumoDTO) {
        return insumoRepository.findById(id)
                .map(existing -> {
                    existing.setNombreComercial(insumoDTO.getNombreComercial());
                    existing.setTipo(insumoDTO.getTipo());
                    existing.setStockActual(insumoDTO.getStockActual());
                    existing.setUmbralCritico(insumoDTO.getUmbralCritico());
                    existing.setUnidadMedida(insumoDTO.getUnidadMedida());
                    return InventoryMapper.toDTO(insumoRepository.save(existing));
                })
                .orElseThrow(() -> new RuntimeException("Insumo no encontrado"));
    }

    @DeleteMapping("/insumos/{id}")
    public void eliminarInsumo(@PathVariable Long id) {
        insumoRepository.deleteById(id);
    }
}
