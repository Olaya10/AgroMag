package com.AgroMag.report_service.service;

import com.AgroMag.report_service.client.FincaServiceClient;
import com.AgroMag.report_service.client.InventoryServiceClient;
import com.AgroMag.report_service.dto.*;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardServiceImpl.class);

    private final FincaServiceClient fincaServiceClient;
    private final InventoryServiceClient inventoryServiceClient;

    @Override
    @CircuitBreaker(name = "dashboardService", fallbackMethod = "dashboardFallback")
    @Retry(name = "dashboardService")
    public DashboardMetricsDTO getDashboardMetrics() {
        List<CultivoDTO> cultivos = fincaServiceClient.getAllCultivos();
        List<RiegoDTO> riegos = fincaServiceClient.getAllRiegos();
        List<LoteDTO> lotes = fincaServiceClient.getAllLotes();
        List<AplicacionDTO> aplicaciones = inventoryServiceClient.getAllAplicaciones();
        List<InsumoDTO> insumos = inventoryServiceClient.getAllInsumos();

        DashboardMetricsDTO metrics = new DashboardMetricsDTO();
        metrics.setTotalRegistros((cultivos != null ? cultivos.size() : 0) + 
                                  (riegos != null ? riegos.size() : 0) + 
                                  (aplicaciones != null ? aplicaciones.size() : 0));

        long alertas = 0;
        if (insumos != null) {
            alertas = insumos.stream()
                .filter(i -> i.getStockActual() != null && i.getUmbralCritico() != null 
                        && i.getStockActual() <= i.getUmbralCritico())
                .count();
        }
        metrics.setAlertasPendientes((int) alertas);

        if (aplicaciones != null && !aplicaciones.isEmpty()) {
            AplicacionDTO lastApp = aplicaciones.get(aplicaciones.size() - 1);
            DashboardMetricsDTO.UltimaAplicacionDTO ua = new DashboardMetricsDTO.UltimaAplicacionDTO();
            ua.setInsumoNombre(lastApp.getInsumo() != null ? lastApp.getInsumo().getNombreComercial() : "Insumo");
            ua.setDosis(lastApp.getDosis());
            ua.setFecha(lastApp.getFecha() != null ? lastApp.getFecha().toString() : "");
            metrics.setUltimaAplicacion(ua);
        }

        double costoFertilizantes = 0;
        double costoPesticidas = 0;
        double costoOtros = 0;
        
        if (aplicaciones != null) {
            for (AplicacionDTO app : aplicaciones) {
                double precioUnitario = 15.0; 
                double costo = (app.getDosis() != null ? app.getDosis() : 0) * precioUnitario;
                String tipo = (app.getInsumo() != null && app.getInsumo().getTipo() != null) ? app.getInsumo().getTipo().toUpperCase() : "OTRO";
                
                if ("FERTILIZANTE".equals(tipo)) costoFertilizantes += costo;
                else if ("PESTICIDA".equals(tipo)) costoPesticidas += costo;
                else costoOtros += costo;
            }
        }
        
        DashboardMetricsDTO.CostosConsolidadosDTO costos = new DashboardMetricsDTO.CostosConsolidadosDTO();
        costos.setFertilizantes(costoFertilizantes);
        costos.setPesticidas(costoPesticidas);
        costos.setOtros(costoOtros);
        double costoTotal = costoFertilizantes + costoPesticidas + costoOtros;
        costos.setTotal(costoTotal);
        metrics.setCostosConsolidados(costos);

        double ingresoEstimado = (cultivos != null ? cultivos.size() : 0) * 8500.0;
        double rentabilidad = ingresoEstimado - costoTotal;
        double roi = costoTotal > 0 ? (rentabilidad / costoTotal) * 100 : 0.0;
        
        DashboardMetricsDTO.RentabilidadDTO rent = new DashboardMetricsDTO.RentabilidadDTO();
        rent.setIngresoBruto(ingresoEstimado);
        rent.setCostosOperativos(costoTotal);
        rent.setUtilidadNeta(rentabilidad);
        rent.setRoi(String.format(Locale.US, "%.1f", roi));
        metrics.setRentabilidadEstimada(rent);

        DashboardMetricsDTO.CalendarioDTO cal = new DashboardMetricsDTO.CalendarioDTO();
        String[] meses = {
            "Enero: Época ideal para preparación de suelos y fertilización base.",
            "Febrero: Monitoreo de plagas tempranas por humedad.",
            "Marzo: Inicio de riegos fuertes según necesidad de floración.",
            "Abril: Aplicación preventiva de fungicidas por lluvias.",
            "Mayo: Poda de formación y mantenimiento de lotes.",
            "Junio: Época de cosecha temprana para variedades rápidas.",
            "Julio: Cosecha principal, preparar bodega de almacenamiento.",
            "Agosto: Limpieza post-cosecha y análisis de suelo.",
            "Septiembre: Siembra de ciclo corto si aplica.",
            "Octubre: Refuerzo de nutrientes para cultivos de fin de año.",
            "Noviembre: Control de malezas previo al cierre de ciclo.",
            "Diciembre: Planificación financiera y descanso de lotes críticos."
        };
        int currentMonth = java.time.LocalDate.now().getMonthValue() - 1;
        String mes = java.time.LocalDate.now().getMonth().getDisplayName(java.time.format.TextStyle.FULL, Locale.of("es", "ES"));
        cal.setMesActual(mes.substring(0, 1).toUpperCase() + mes.substring(1));
        cal.setSugerencia(meses[currentMonth]);
        metrics.setCalendarioAgricola(cal);

        if (riegos != null) {
            int start = Math.max(0, riegos.size() - 7);
            List<RiegoDTO> lastRiegos = riegos.subList(start, riegos.size());
            List<DashboardMetricsDTO.RiegoChartDTO> chart = lastRiegos.stream().map(r -> {
                DashboardMetricsDTO.RiegoChartDTO c = new DashboardMetricsDTO.RiegoChartDTO();
                c.setId(r.getId());
                c.setEjecutado(r.getCantidadAguaLitros() != null ? r.getCantidadAguaLitros() : 0.0);
                c.setProgramado(150.0);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM d", Locale.of("es", "ES"));
                c.setFechaCorta(r.getFechaHora() != null ? r.getFechaHora().format(formatter) : "");
                return c;
            }).collect(Collectors.toList());
            metrics.setRiegosRecientesChart(chart);
            
            int start5 = Math.max(0, riegos.size() - 5);
            List<RiegoDTO> riegos5 = new ArrayList<>(riegos.subList(start5, riegos.size()));
            Collections.reverse(riegos5);
            
            List<DashboardMetricsDTO.RiegoItemDTO> ultimos = riegos5.stream().map(r -> {
                DashboardMetricsDTO.RiegoItemDTO item = new DashboardMetricsDTO.RiegoItemDTO();
                item.setId(r.getId());
                item.setLoteNombre(r.getLote() != null && r.getLote().getNombre() != null ? r.getLote().getNombre() : "Lote desconocido");
                item.setFecha(r.getFechaHora() != null ? r.getFechaHora().toString() : "");
                item.setCantidad(r.getCantidadAguaLitros());
                item.setObservaciones(r.getObservaciones() != null ? r.getObservaciones() : "Sin observaciones");
                return item;
            }).collect(Collectors.toList());
            metrics.setUltimosRiegos(ultimos);
        }

        if (aplicaciones != null) {
            int start5 = Math.max(0, aplicaciones.size() - 5);
            List<AplicacionDTO> apps5 = new ArrayList<>(aplicaciones.subList(start5, aplicaciones.size()));
            Collections.reverse(apps5);
            
            Map<Long, LoteDTO> loteMap = lotes != null ? lotes.stream().collect(Collectors.toMap(LoteDTO::getId, l -> l)) : new HashMap<>();
            
            List<DashboardMetricsDTO.AplicacionItemDTO> ultimas = apps5.stream().map(app -> {
                DashboardMetricsDTO.AplicacionItemDTO item = new DashboardMetricsDTO.AplicacionItemDTO();
                item.setId(app.getId());
                item.setInsumoNombre(app.getInsumo() != null ? app.getInsumo().getNombreComercial() : "Insumo sin nombre");
                item.setFecha(app.getFecha() != null ? app.getFecha().toString() : "");
                item.setDosis(app.getDosis());
                
                LoteDTO lote = loteMap.get(app.getLoteId());
                if (lote != null) {
                    item.setLoteNombre(lote.getNombre() != null ? lote.getNombre() : "Lote sin nombre");
                    item.setFincaNombre(lote.getFinca() != null && lote.getFinca().getNombre() != null ? lote.getFinca().getNombre() : "Finca sin nombre");
                } else {
                    item.setLoteNombre("Lote desconocido");
                    item.setFincaNombre("Finca desconocida");
                }
                return item;
            }).collect(Collectors.toList());
            metrics.setUltimasAplicaciones(ultimas);
        }
        
        return metrics;
    }

    public DashboardMetricsDTO dashboardFallback(Exception e) {
        log.error("Circuit breaker triggered for getDashboardMetrics. Returning default empty metrics. Error: {}", e.getMessage());
        DashboardMetricsDTO emptyMetrics = new DashboardMetricsDTO();
        emptyMetrics.setTotalRegistros(0);
        emptyMetrics.setAlertasPendientes(0);
        
        DashboardMetricsDTO.CostosConsolidadosDTO costos = new DashboardMetricsDTO.CostosConsolidadosDTO();
        costos.setFertilizantes(0.0);
        costos.setPesticidas(0.0);
        costos.setOtros(0.0);
        costos.setTotal(0.0);
        emptyMetrics.setCostosConsolidados(costos);

        DashboardMetricsDTO.RentabilidadDTO rent = new DashboardMetricsDTO.RentabilidadDTO();
        rent.setIngresoBruto(0.0);
        rent.setCostosOperativos(0.0);
        rent.setUtilidadNeta(0.0);
        rent.setRoi("0.0");
        emptyMetrics.setRentabilidadEstimada(rent);

        emptyMetrics.setRiegosRecientesChart(new ArrayList<>());
        emptyMetrics.setUltimosRiegos(new ArrayList<>());
        emptyMetrics.setUltimasAplicaciones(new ArrayList<>());
        
        return emptyMetrics;
    }
}
