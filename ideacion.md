# Manual de ideación del proyecto de data journalism

## Análisis del conflicto EE. UU.–Irán

Este documento define la **idea editorial, la estructura narrativa, las visualizaciones y los recursos técnicos** para un especial interactivo tipo *scrollytelling* sobre el conflicto entre Estados Unidos y Irán.

El objetivo es construir **una historia visual de largo formato** que combine narrativa histórica, datos geopolíticos y visualizaciones interactivas para explicar cómo la relación entre ambos países evolucionó desde cooperación hasta confrontación estratégica.

---

# Estructura narrativa del especial

## 1. Hero (portada)

### Objetivo

Capturar atención y situar geográficamente el conflicto.

### Visualización sugerida

**Mapa geopolítico animado del Medio Oriente**

Elementos visuales:

* Irán resaltado
* bases militares estadounidenses
* rutas petroleras estratégicas
* estrecho de Ormuz

### Dinámica interactiva

* Animación inicial suave.
* Al hacer scroll aparecen progresivamente capas del mapa:

  1. geografía
  2. bases militares
  3. rutas energéticas
  4. zonas de tensión.

### Recursos posibles

Datos de bases militares:

* SIPRI
* CSIS Military Balance

Mapas:

* Natural Earth
* Mapbox

---

# 2. Contexto histórico

### Objetivo

Introducir rápidamente al lector en la evolución de la relación bilateral.

### Visualización sugerida

**Timeline interactivo simplificado**

Eventos clave:

* 1953 golpe en Irán
* 1979 revolución iraní
* guerra Irán-Irak
* acuerdo nuclear 2015
* asesinato de Qasem Soleimani.

### Dinámica

* Scroll activa cada evento.
* Hover revela breve contexto histórico.

### Recursos

Líneas de tiempo históricas de:

* Council on Foreign Relations
* Brookings Institution

---

# 3. Golpe de Estado de 1953

Evento clave:

1953 Iranian coup d'état

### Objetivo

Explicar el origen del resentimiento histórico iraní hacia Occidente.

### Visualización sugerida

**Story map del golpe**

Capas del mapa:

* nacionalización del petróleo
* instalaciones petroleras
* intervención de inteligencia occidental
* restauración del Shah.

### Dinámica

Scroll step-by-step:

1. Mossadegh nacionaliza petróleo
2. presión internacional
3. operación encubierta
4. caída del gobierno.

### Recursos

Archivos históricos:

* National Security Archive
* CIA declassified documents.

---

# 4. Revolución de 1979

Evento:

Iranian Revolution

### Objetivo

Mostrar la ruptura total de relaciones.

### Visualización sugerida

**Contador interactivo de la crisis de rehenes**

Evento asociado:

Iran hostage crisis

### Dinámica

Animación que muestra los **444 días de duración**.

Elementos adicionales:

* titulares históricos
* fotografías
* citas políticas.

### Recursos

Archivos mediáticos:

* AP Archive
* Getty Images editorial.

---

# 5. Guerra regional

Evento:

Iran–Iraq War

### Objetivo

Explicar cómo el conflicto se transformó en una disputa geopolítica regional.

### Visualización sugerida

**Mapa interactivo del conflicto**

Capas:

* líneas de frente
* apoyo internacional
* ataques a petroleros.

### Dinámica

Slider temporal (1980-1988) que muestra:

* evolución territorial
* escalada militar
* impacto petrolero.

### Recursos

Datos históricos de:

* Uppsala Conflict Data Program
* Correlates of War.

---

# 6. Programa nuclear

Evento:

Joint Comprehensive Plan of Action

### Objetivo

Explicar el centro del conflicto moderno.

### Visualización sugerida

**Gráfico de enriquecimiento de uranio**

Variables posibles:

* capacidad nuclear
* inspecciones
* sanciones.

### Dinámica

Gráfico animado que cambia entre:

* antes del acuerdo
* durante el acuerdo
* tras su ruptura.

### Recursos

Datos de:

* International Atomic Energy Agency
* Nuclear Threat Initiative.

---

# 7. Impacto económico

### Objetivo

Mostrar las consecuencias de las sanciones internacionales.

### Visualización sugerida

**Dashboard económico simple**

Gráficos:

1. exportaciones petroleras
2. inflación
3. crecimiento del PIB.

### Dinámica

Slider comparativo:

antes de sanciones vs después de sanciones.

### Recursos

Datos económicos:

* World Bank
* International Monetary Fund
* EIA energy statistics.

---

# 8. Red de proxies regionales

Actores clave:

* Hezbollah
* Hamas
* Houthis

### Objetivo

Explicar cómo el conflicto se desarrolla mediante aliados regionales.

### Visualización sugerida

**Network graph geopolítico**

Nodos:

* Irán
* grupos armados
* aliados regionales.

### Dinámica

Hover ilumina conexiones.

Filtros por región:

* Líbano
* Gaza
* Yemen.

### Recursos

Bases de datos:

* ACLED conflict database
* Armed Conflict Location & Event Data.

---

# 9. Escalada reciente

Evento central:

asesinato de

Qasem Soleimani

### Objetivo

Mostrar el incremento de tensiones recientes.

### Visualización sugerida

**Timeline militar interactivo**

Variables:

* ataques de drones
* sanciones
* negociaciones.

### Dinámica

Hover muestra detalles del evento.

### Recursos

Bases de datos:

* ACLED
* Global Terrorism Database.

---

# 10. Escenarios futuros

### Objetivo

Cerrar el especial con análisis prospectivo.

### Visualización sugerida

**Simulador de escenarios geopolíticos**

Opciones:

* diplomacia
* guerra regional
* conflicto directo.

### Dinámica

Seleccionar escenario modifica:

* mapa de alianzas
* indicadores de riesgo.

### Recursos

Modelos analíticos basados en:

* think tanks
* estudios estratégicos.

---

# Tono editorial

El tono debe ser:

* analítico
* visual
* explicativo
* basado en evidencia.

Evitar:

* sensacionalismo
* exceso de texto.

Inspiración editorial:

* Financial Times
* The Washington Post
* The New York Times

---

# Herramientas recomendadas

## Frontend

Frameworks posibles:

* Next.js
* SvelteKit.

---

## Visualización de datos

Bibliotecas:

* D3.js
* Observable Plot
* Vega-Lite.

---

## Mapas

Herramientas geoespaciales:

* Mapbox GL JS
* Leaflet.

Datos geográficos:

* Natural Earth
* OpenStreetMap.

---

## Interacciones de scrollytelling

Bibliotecas recomendadas:

* Scrollama
* GSAP.

---

# Fuentes de información clave

### Geopolítica

* Council on Foreign Relations
* Carnegie Endowment for International Peace

### Economía

* World Bank
* International Monetary Fund

### Conflictos armados

* ACLED
* Uppsala Conflict Data Program.

---

# Resultado esperado del proyecto

Un especial interactivo que permita:

* comprender **70 años de historia geopolítica**
* visualizar **datos económicos y militares**
* explorar **escenarios futuros del conflicto**.

El proyecto combina:

* narrativa histórica
* análisis de datos
* visualización interactiva.

Este tipo de formato se posiciona como uno de los estándares del **data journalism contemporáneo**.


