# Destructor de Meteoros

Este repositorio contiene un sencillo juego de disparos desarrollado en JavaScript.

## Ejecuci\u00f3n

Para evitar problemas de seguridad del navegador, es recomendable abrir `index.html` mediante un servidor web local. Por ejemplo:

```bash
# Con Python 3
python -m http.server
```

Luego visita `http://localhost:8000/` y selecciona `index.html` para comenzar.

## Controles

- **Rat\u00f3n**: mueve el cursor para dirigir la nave y haz clic para disparar.
- **Teclado**: usa las flechas o `W`, `A`, `S`, `D` para moverte. Al detectarse controles t\u00e1ctiles, la barra espaciadora sirve para disparar.
- El bot\u00f3n **\"Empezar\"** inicia la partida.
- El bot\u00f3n **\"Pausa\"** pausa o reanuda el juego.

## Notas

La inicializaci\u00f3n de audio es opcional y se activa al comenzar la partida. El juego adem\u00e1s guarda la puntuaci\u00f3n m\u00e1xima en `localStorage` del navegador.
