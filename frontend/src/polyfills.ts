/**
 * Este arquivo inclui polyfills necessários para o Angular e é carregado antes do app.
 * Você pode adicionar seus próprios polyfills extras para este arquivo.
 *
 * Este arquivo é dividido em 2 seções:
 *   1. Polyfills de navegador. Esses são aplicados antes de carregar o ZoneJS e são ordenados por requisitos do navegador.
 *   2. Imports do ambiente da aplicação. Arquivos importados após o ZoneJS que devem ser carregados antes do seu app principal.
 *
 * A configuração atual é para os chamados "browsers evergreen" (Chrome, Firefox, Edge, Safari, etc)
 */

/**
 * Zone JS é necessário para o funcionamento do Angular.
 */
import 'zone.js';  // Incluído com Angular CLI.

/***************************************************************************************************
 * CONFIGURAÇÃO DO AMBIENTE DA APLICAÇÃO
 */ 