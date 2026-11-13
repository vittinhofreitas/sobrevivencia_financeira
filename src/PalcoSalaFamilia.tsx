/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, Heart, MessageSquare } from 'lucide-react';

export type EstadoHumorFamilia = 'feliz' | 'preocupado' | 'panico';
export type ModoJogo = 'familia' | 'individual' | 'familia_grande';
export type GeneroPersonagem = 'homem' | 'mulher';

export type TipoNPC =
  | 'tecnico'
  | 'amigo_festa'
  | 'cobrador_luz'
  | 'vendedor_shopping'
  | 'mecanico'
  | 'chefe'
  | 'caixa_mercado'
  | 'dentista'
  | 'streaming_bot'
  | 'diretora_escola'
  | 'encanador'
  | 'comprador_web'
  | 'entregador'
  | 'esteticista'
  | 'barbeiro'
  | 'agente_viagem'
  | 'assistente_social';

export interface ParticulaFlutuante {
  id: number;
  texto: string;
  cor: 'verde' | 'vermelho' | 'rosa' | 'amarelo' | 'azul';
  xPercent: number;
  yPercent: number;
}

interface PalcoSalaFamiliaProps {
  modoJogo: ModoJogo;
  generoPersonagem: GeneroPersonagem;
  humor: EstadoHumorFamilia;
  saldoAtual: number;
  felicidadeFamilia: number;
  mesNome?: string;
  npcAtivo?: {
    nome: string;
    cargo: string;
    tipo: TipoNPC;
    fala: string;
    tituloEvento: string;
    categoria: string;
  } | null;
  falaFamilia?: string;
  jurosCobradosNoMes?: number;
  particulas: ParticulaFlutuante[];
  modoCompacto?: boolean;
}

// ============================================================================
// AVATARES SVG SOLO (MODO INDIVIDUAL: HOMEM OU MULHER CENTRALIZADO NA SALA)
// ============================================================================

function PersonagemSoloHomemSVG({ humor }: { humor: EstadoHumorFamilia }) {
  return (
    <svg
      viewBox="0 0 130 175"
      className={`w-28 sm:w-32 h-36 sm:h-40 overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
    >
      <ellipse cx="65" cy="166" rx="36" ry="7" fill="rgba(15,23,42,0.2)" />
      <rect x="44" y="116" width="17" height="42" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
      <rect x="69" y="116" width="17" height="42" rx="6" fill="#1e293b" stroke="#0f172a" strokeWidth="3.5" />
      <rect x="37" y="151" width="25" height="12" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
      <rect x="68" y="151" width="25" height="12" rx="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
      <rect x="35" y="68" width="60" height="53" rx="14" fill="#0284c7" stroke="#0f172a" strokeWidth="3.5" />
      <rect x="53" y="68" width="24" height="53" fill="#f8fafc" stroke="#0f172a" strokeWidth="2.8" />
      <line x1="58" y1="72" x2="58" y2="88" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="72" y1="72" x2="72" y2="88" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />

      {humor === 'panico' ? (
        <>
          <path d="M 36 78 Q 14 48 34 30" fill="none" stroke="#0284c7" strokeWidth="11" strokeLinecap="round" />
          <path d="M 36 78 Q 14 48 34 30" fill="none" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 94 78 Q 116 48 96 30" fill="none" stroke="#0284c7" strokeWidth="11" strokeLinecap="round" />
          <path d="M 94 78 Q 116 48 96 30" fill="none" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : humor === 'feliz' ? (
        <>
          <rect x="22" y="72" width="14" height="38" rx="7" fill="#0284c7" stroke="#0f172a" strokeWidth="3.2" />
          <path d="M 94 78 Q 115 58 110 40" fill="none" stroke="#0284c7" strokeWidth="11" strokeLinecap="round" />
          <circle cx="110" cy="38" r="6.5" fill="#fed7aa" stroke="#0f172a" strokeWidth="3" />
        </>
      ) : (
        <>
          <rect x="22" y="74" width="14" height="38" rx="7" fill="#0284c7" stroke="#0f172a" strokeWidth="3.2" />
          <rect x="94" y="74" width="14" height="38" rx="7" fill="#0284c7" stroke="#0f172a" strokeWidth="3.2" />
        </>
      )}

      <circle cx="65" cy="42" r="26" fill="#fed7aa" stroke="#0f172a" strokeWidth="3.5" />
      <path
        d="M 39 36 Q 40 10 65 11 Q 90 10 91 36 Q 80 23 65 25 Q 49 23 39 36 Z"
        fill="#1e293b"
        stroke="#0f172a"
        strokeWidth="3"
      />
      <path d="M 48 56 Q 65 68 82 56" fill="none" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
      <rect x="46" y="63" width="12" height="8" rx="4" fill="#ef4444" stroke="#0f172a" strokeWidth="2.4" />
      <rect x="72" y="63" width="12" height="8" rx="4" fill="#ef4444" stroke="#0f172a" strokeWidth="2.4" />
      <circle cx="54" cy="41" r="3" fill="#0f172a" />
      <circle cx="76" cy="41" r="3" fill="#0f172a" />

      {humor === 'feliz' && (
        <>
          <path d="M 47 33 Q 54 29 60 33" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 70 33 Q 76 29 83 33" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 52 51 Q 65 62 78 51 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.6" />
        </>
      )}

      {humor === 'preocupado' && (
        <>
          <line x1="46" y1="34" x2="59" y2="31" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="71" y1="31" x2="84" y2="34" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 53 54 Q 60 49 65 54 Q 70 58 77 52" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 95 26 Q 100 35 95 40 Q 90 35 95 26 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        </>
      )}

      {humor === 'panico' && (
        <>
          <line x1="46" y1="30" x2="59" y2="35" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <line x1="71" y1="35" x2="84" y2="30" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="65" cy="54" rx="9" ry="7" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M 44 45 Q 35 51 39 58" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 86 45 Q 95 51 91 58" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonagemSoloMulherSVG({ humor }: { humor: EstadoHumorFamilia }) {
  return (
    <svg
      viewBox="0 0 130 175"
      className={`w-28 sm:w-32 h-36 sm:h-40 overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
    >
      <ellipse cx="65" cy="166" rx="36" ry="7" fill="rgba(15,23,42,0.2)" />
      <rect x="28" y="16" width="74" height="62" rx="28" fill="#451a03" stroke="#0f172a" strokeWidth="3.5" />
      <rect x="45" y="115" width="16" height="42" rx="6" fill="#312e81" stroke="#0f172a" strokeWidth="3.2" />
      <rect x="69" y="115" width="16" height="42" rx="6" fill="#312e81" stroke="#0f172a" strokeWidth="3.2" />
      <rect x="39" y="151" width="23" height="12" rx="6" fill="#e11d48" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="68" y="151" width="23" height="12" rx="6" fill="#e11d48" stroke="#0f172a" strokeWidth="2.8" />
      <polygon
        points="37,68 93,68 99,118 31,118"
        fill="#ec4899"
        stroke="#0f172a"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path d="M 51 69 Q 65 81 79 69" fill="none" stroke="#facc15" strokeWidth="3.5" strokeLinecap="round" />

      {humor === 'panico' ? (
        <>
          <path d="M 38 76 Q 16 48 35 30" fill="none" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
          <path d="M 92 76 Q 114 48 95 30" fill="none" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
        </>
      ) : humor === 'feliz' ? (
        <>
          <rect x="23" y="72" width="13" height="36" rx="6.5" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
          <path d="M 93 76 Q 114 56 108 38" fill="none" stroke="#fde68a" strokeWidth="10" strokeLinecap="round" />
          <circle cx="108" cy="37" r="6" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
        </>
      ) : (
        <>
          <rect x="23" y="72" width="13" height="36" rx="6.5" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
          <rect x="94" y="72" width="13" height="36" rx="6.5" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
        </>
      )}

      <circle cx="37" cy="48" r="6" fill="none" stroke="#facc15" strokeWidth="3" />
      <circle cx="93" cy="48" r="6" fill="none" stroke="#facc15" strokeWidth="3" />
      <circle cx="65" cy="42" r="25" fill="#fde68a" stroke="#0f172a" strokeWidth="3.5" />
      <path
        d="M 40 36 Q 48 14 65 16 Q 82 14 90 36 Q 76 25 65 29 Q 52 25 40 36 Z"
        fill="#451a03"
        stroke="#0f172a"
        strokeWidth="3"
      />
      <circle cx="55" cy="41" r="3" fill="#0f172a" />
      <circle cx="75" cy="41" r="3" fill="#0f172a" />
      <circle cx="47" cy="47" r="4" fill="#fb7185" opacity="0.55" />
      <circle cx="83" cy="47" r="4" fill="#fb7185" opacity="0.55" />

      {humor === 'feliz' && (
        <>
          <path d="M 48 33 Q 55 29 61 33" fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 69 33 Q 75 29 82 33" fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 53 51 Q 65 62 77 51 Z" fill="#e11d48" stroke="#0f172a" strokeWidth="2.6" />
        </>
      )}

      {humor === 'preocupado' && (
        <>
          <line x1="48" y1="34" x2="59" y2="31" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <line x1="71" y1="31" x2="82" y2="34" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 54 54 Q 65 48 76 54" fill="none" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 95 26 Q 100 35 95 40 Q 90 35 95 26 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        </>
      )}

      {humor === 'panico' && (
        <>
          <ellipse cx="65" cy="54" rx="8.5" ry="6.5" fill="#991b1b" stroke="#0f172a" strokeWidth="2.6" />
          <path d="M 45 45 Q 36 51 40 58" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 85 45 Q 94 51 90 58" fill="none" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// ============================================================================
// AVATARES SVG DOS PERSONAGENS DA FAMÍLIA E FAMÍLIA GRANDE
// ============================================================================

function PersonagemVovoSVG({ humor }: { humor: EstadoHumorFamilia }) {
  return (
    <svg
      viewBox="0 0 105 145"
      className={`w-16 sm:w-20 h-24 sm:h-30 overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
      style={{ animationDelay: '0.1s' }}
    >
      <ellipse cx="52" cy="138" rx="26" ry="5" fill="rgba(15,23,42,0.2)" />
      <circle cx="52" cy="12" r="12" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2.8" />
      <polygon
        points="32,64 72,64 80,126 24,126"
        fill="#0d9488"
        stroke="#0f172a"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M 28 65 Q 52 84 76 65" fill="#fef08a" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="34" y="126" width="15" height="9" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="55" y="126" width="15" height="9" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="21" y="67" width="10" height="28" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="73" y="67" width="10" height="28" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="52" cy="39" r="21" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <path
        d="M 31 35 Q 36 17 52 19 Q 68 17 73 35 Q 62 26 52 29 Q 42 26 31 35 Z"
        fill="#cbd5e1"
        stroke="#0f172a"
        strokeWidth="2.8"
      />
      <circle cx="43" cy="39" r="6" fill="#ffffff" fillOpacity="0.65" stroke="#0f172a" strokeWidth="2.2" />
      <circle cx="61" cy="39" r="6" fill="#ffffff" fillOpacity="0.65" stroke="#0f172a" strokeWidth="2.2" />
      <line x1="49" y1="39" x2="55" y2="39" stroke="#0f172a" strokeWidth="2.2" />
      <circle cx="43" cy="39" r="2.2" fill="#0f172a" />
      <circle cx="61" cy="39" r="2.2" fill="#0f172a" />

      {humor === 'feliz' && (
        <path d="M 43 49 Q 52 56 61 49" fill="none" stroke="#be123c" strokeWidth="2.6" strokeLinecap="round" />
      )}
      {humor === 'preocupado' && (
        <path d="M 44 51 Q 52 47 60 51" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {humor === 'panico' && (
        <>
          <circle cx="52" cy="51" r="5" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M 34 42 Q 28 47 31 53" fill="none" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonagemFilhaSVG({ humor }: { humor: EstadoHumorFamilia }) {
  return (
    <svg
      viewBox="0 0 100 140"
      className={`w-16 sm:w-20 h-24 sm:h-30 overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
      style={{ animationDelay: '0.28s' }}
    >
      <ellipse cx="50" cy="133" rx="24" ry="5" fill="rgba(15,23,42,0.2)" />
      <circle cx="24" cy="30" r="9" fill="#451a03" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="76" cy="30" r="9" fill="#451a03" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="37" y="96" width="11" height="30" rx="4" fill="#312e81" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="52" y="96" width="11" height="30" rx="4" fill="#312e81" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="33" y="122" width="16" height="9" rx="4" fill="#ec4899" stroke="#0f172a" strokeWidth="2.4" />
      <rect x="51" y="122" width="16" height="9" rx="4" fill="#ec4899" stroke="#0f172a" strokeWidth="2.4" />
      <rect x="30" y="60" width="40" height="39" rx="10" fill="#facc15" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="21" y="63" width="10" height="26" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.4" />
      <rect x="69" y="63" width="10" height="26" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.4" />
      <circle cx="50" cy="38" r="20" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
      <path d="M 30 33 Q 36 16 50 17 Q 64 16 70 33 Q 58 24 50 27 Q 40 24 30 33 Z" fill="#451a03" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="43" cy="38" r="2.5" fill="#0f172a" />
      <circle cx="57" cy="38" r="2.5" fill="#0f172a" />

      {humor === 'feliz' && (
        <path d="M 42 46 Q 50 54 58 46 Z" fill="#e11d48" stroke="#0f172a" strokeWidth="2.2" />
      )}
      {humor === 'preocupado' && (
        <line x1="43" y1="48" x2="57" y2="46" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
      )}
      {humor === 'panico' && (
        <>
          <circle cx="50" cy="48" r="5" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.2" />
          <path d="M 65 40 Q 71 45 68 51" fill="none" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonagemPaiSVG({ humor, compacto }: { humor: EstadoHumorFamilia; compacto?: boolean }) {
  return (
    <svg
      viewBox="0 0 110 155"
      className={`${
        compacto ? 'w-16 sm:w-20 h-24 sm:h-30' : 'w-20 sm:w-24 h-28 sm:h-34'
      } overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
    >
      <ellipse cx="55" cy="148" rx="30" ry="6" fill="rgba(15,23,42,0.2)" />
      <rect x="37" y="105" width="14" height="38" rx="5" fill="#1e3a8a" stroke="#0f172a" strokeWidth="3.2" />
      <rect x="59" y="105" width="14" height="38" rx="5" fill="#1e3a8a" stroke="#0f172a" strokeWidth="3.2" />
      <rect x="31" y="136" width="21" height="10" rx="5" fill="#451a03" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="58" y="136" width="21" height="10" rx="5" fill="#451a03" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="30" y="64" width="50" height="46" rx="12" fill="#10b981" stroke="#0f172a" strokeWidth="3.2" />
      <polygon points="45,64 55,76 65,64" fill="#ecfdf5" stroke="#0f172a" strokeWidth="2.4" />

      {humor === 'panico' ? (
        <>
          <path d="M 32 72 Q 12 45 30 28" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
          <path d="M 32 72 Q 12 45 30 28" fill="none" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 78 72 Q 98 45 80 28" fill="none" stroke="#f59e0b" strokeWidth="10" strokeLinecap="round" />
          <path d="M 78 72 Q 98 45 80 28" fill="none" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : humor === 'feliz' ? (
        <>
          <path d="M 31 74 Q 15 88 22 104" fill="none" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
          <path d="M 79 74 Q 98 56 94 40" fill="none" stroke="#f59e0b" strokeWidth="9" strokeLinecap="round" />
          <circle cx="94" cy="39" r="5.5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
        </>
      ) : (
        <>
          <rect x="20" y="68" width="12" height="34" rx="6" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
          <rect x="78" y="68" width="12" height="34" rx="6" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
        </>
      )}

      <circle cx="55" cy="38" r="24" fill="#fde68a" stroke="#0f172a" strokeWidth="3.2" />
      <path
        d="M 31 34 Q 32 11 55 12 Q 78 11 79 34 Q 68 23 55 25 Q 40 23 31 34 Z"
        fill="#451a03"
        stroke="#0f172a"
        strokeWidth="2.8"
      />
      <rect x="38" y="31" width="14" height="10" rx="3" fill="#ffffff" fillOpacity="0.6" stroke="#0f172a" strokeWidth="2.2" />
      <rect x="58" y="31" width="14" height="10" rx="3" fill="#ffffff" fillOpacity="0.6" stroke="#0f172a" strokeWidth="2.2" />
      <line x1="52" y1="36" x2="58" y2="36" stroke="#0f172a" strokeWidth="2.2" />
      <circle cx="45" cy="36" r="2.5" fill="#0f172a" />
      <circle cx="65" cy="36" r="2.5" fill="#0f172a" />

      {humor === 'feliz' && (
        <>
          <path d="M 39 27 Q 45 24 51 27" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 59 27 Q 65 24 71 27" fill="none" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 44 47 Q 55 57 66 47 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.4" />
        </>
      )}

      {humor === 'preocupado' && (
        <>
          <line x1="38" y1="28" x2="50" y2="25" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="60" y1="25" x2="72" y2="28" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 45 50 Q 50 46 55 50 Q 60 54 65 49" fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 82 24 Q 87 32 82 36 Q 77 32 82 24 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
        </>
      )}

      {humor === 'panico' && (
        <>
          <line x1="38" y1="24" x2="50" y2="28" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <line x1="60" y1="28" x2="72" y2="24" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx="55" cy="50" rx="8" ry="6" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.4" />
          <path d="M 36 40 Q 28 45 32 51" fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 74 40 Q 82 45 78 51" fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonagemMaeSVG({ humor, compacto }: { humor: EstadoHumorFamilia; compacto?: boolean }) {
  return (
    <svg
      viewBox="0 0 110 155"
      className={`${
        compacto ? 'w-16 sm:w-20 h-24 sm:h-30' : 'w-20 sm:w-24 h-28 sm:h-34'
      } overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
      style={{ animationDelay: '0.2s' }}
    >
      <ellipse cx="55" cy="148" rx="28" ry="6" fill="rgba(15,23,42,0.2)" />
      <rect x="26" y="18" width="58" height="48" rx="18" fill="#7c2d12" stroke="#0f172a" strokeWidth="3.2" />
      <rect x="40" y="106" width="12" height="36" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="58" y="106" width="12" height="36" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="36" y="136" width="18" height="10" rx="5" fill="#be123c" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="56" y="136" width="18" height="10" rx="5" fill="#be123c" stroke="#0f172a" strokeWidth="2.8" />
      <polygon
        points="33,64 77,64 85,112 25,112"
        fill="#8b5cf6"
        stroke="#0f172a"
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <path d="M 44 65 Q 55 75 66 65" fill="none" stroke="#facc15" strokeWidth="3.2" strokeLinecap="round" />

      {humor === 'panico' ? (
        <>
          <path d="M 33 70 Q 15 48 31 32" fill="none" stroke="#fde68a" strokeWidth="9" strokeLinecap="round" />
          <path d="M 77 70 Q 95 48 79 32" fill="none" stroke="#fde68a" strokeWidth="9" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="22" y="67" width="11" height="32" rx="5.5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
          <rect x="77" y="67" width="11" height="32" rx="5.5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.8" />
        </>
      )}

      <circle cx="55" cy="39" r="22" fill="#fde68a" stroke="#0f172a" strokeWidth="3.2" />
      <path
        d="M 33 35 Q 40 16 55 18 Q 70 16 77 35 Q 65 25 55 29 Q 43 25 33 35 Z"
        fill="#7c2d12"
        stroke="#0f172a"
        strokeWidth="2.8"
      />
      <circle cx="46" cy="38" r="2.6" fill="#0f172a" />
      <circle cx="64" cy="38" r="2.6" fill="#0f172a" />
      <circle cx="40" cy="43" r="3.5" fill="#fb7185" opacity="0.5" />
      <circle cx="70" cy="43" r="3.5" fill="#fb7185" opacity="0.5" />

      {humor === 'feliz' && (
        <path d="M 45 47 Q 55 56 65 47" fill="none" stroke="#be123c" strokeWidth="2.8" strokeLinecap="round" />
      )}

      {humor === 'preocupado' && (
        <>
          <line x1="40" y1="31" x2="49" y2="29" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <line x1="61" y1="29" x2="70" y2="31" stroke="#0f172a" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 46 50 Q 55 45 64 50" fill="none" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M 80 26 Q 84 33 80 37 Q 76 33 80 26 Z" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
        </>
      )}

      {humor === 'panico' && (
        <>
          <ellipse cx="55" cy="50" rx="7" ry="5.5" fill="#991b1b" stroke="#0f172a" strokeWidth="2.4" />
          <path d="M 38 41 Q 30 46 34 53" fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 72 41 Q 80 46 76 53" fill="none" stroke="#38bdf8" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PersonagemFilhoSVG({ humor, compacto }: { humor: EstadoHumorFamilia; compacto?: boolean }) {
  return (
    <svg
      viewBox="0 0 95 130"
      className={`${
        compacto ? 'w-14 sm:w-16 h-20 sm:h-24' : 'w-16 sm:w-20 h-24 sm:h-28'
      } overflow-visible ${
        humor === 'feliz'
          ? 'animate-char-bounce'
          : humor === 'panico'
          ? 'animate-char-shiver'
          : ''
      }`}
      style={{ animationDelay: '0.35s' }}
    >
      <ellipse cx="48" cy="123" rx="24" ry="5" fill="rgba(15,23,42,0.2)" />
      <rect x="35" y="92" width="11" height="26" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="50" y="92" width="11" height="26" rx="4" fill="#0284c7" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="31" y="114" width="16" height="9" rx="4" fill="#ef4444" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="49" y="114" width="16" height="9" rx="4" fill="#ef4444" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="29" y="58" width="38" height="37" rx="10" fill="#f97316" stroke="#0f172a" strokeWidth="3" />
      <circle cx="48" cy="76" r="6" fill="#fde047" stroke="#0f172a" strokeWidth="1.8" />
      <rect x="20" y="61" width="10" height="25" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="66" y="61" width="10" height="25" rx="5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="48" cy="37" r="20" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <path d="M 28 31 Q 30 14 48 14 Q 66 14 68 31 Z" fill="#2563eb" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="46" y="25" width="28" height="6" rx="3" fill="#1d4ed8" stroke="#0f172a" strokeWidth="2.6" />
      <circle cx="41" cy="38" r="2.5" fill="#0f172a" />
      <circle cx="55" cy="38" r="2.5" fill="#0f172a" />

      {humor === 'feliz' && (
        <path d="M 40 46 Q 48 54 56 46 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.4" />
      )}
      {humor === 'preocupado' && (
        <line x1="41" y1="48" x2="55" y2="46" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
      )}
      {humor === 'panico' && (
        <>
          <circle cx="48" cy="48" r="5" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2.4" />
          <path d="M 33 41 Q 27 46 30 51" fill="none" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M 63 41 Q 69 46 66 51" fill="none" stroke="#38bdf8" strokeWidth="2.8" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function CachorrinhoCarameloSVG({ humor, compacto }: { humor: EstadoHumorFamilia; compacto?: boolean }) {
  return (
    <svg
      viewBox="0 0 90 80"
      className={`${
        compacto ? 'w-14 sm:w-16 h-12 sm:h-15' : 'w-16 sm:w-20 h-14 sm:h-18'
      } overflow-visible ${
        humor === 'feliz' ? 'animate-char-bounce' : humor === 'panico' ? 'animate-char-shiver' : ''
      }`}
    >
      <ellipse cx="45" cy="73" rx="28" ry="5" fill="rgba(15,23,42,0.18)" />
      <path
        d={humor === 'feliz' ? 'M 18 48 Q 5 32 14 26' : 'M 18 54 Q 8 60 12 66'}
        fill="none"
        stroke="#d97706"
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <ellipse cx="40" cy="52" rx="22" ry="15" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.8" />
      <rect x="24" y="60" width="8" height="13" rx="4" fill="#d97706" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="35" y="61" width="8" height="12" rx="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.6" />
      <rect x="48" y="60" width="8" height="13" rx="4" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.6" />
      <path d="M 49 41 L 58 55" stroke="#ef4444" strokeWidth="4.5" strokeLinecap="round" />
      <circle cx="58" cy="36" r="15" fill="#f59e0b" stroke="#0f172a" strokeWidth="2.8" />
      <ellipse cx="48" cy="36" rx="5" ry="10" fill="#92400e" stroke="#0f172a" strokeWidth="2.4" />
      <ellipse cx="69" cy="39" rx="7" ry="5.5" fill="#fde68a" stroke="#0f172a" strokeWidth="2.4" />
      <circle cx="73" cy="37" r="2.8" fill="#0f172a" />
      <circle cx="60" cy="32" r="2.4" fill="#0f172a" />
      {humor === 'feliz' && (
        <path d="M 67 44 Q 69 52 73 45" fill="#fb7185" stroke="#0f172a" strokeWidth="1.8" />
      )}
    </svg>
  );
}

// ============================================================================
// AVATAR SVG DO NPC VISITANTE
// ============================================================================

function AvatarNPCSVG({ tipo }: { tipo: TipoNPC }) {
  const config: Record<
    TipoNPC,
    { corRoupa: string; corChapeu: string; temChapeu: boolean; corPele: string }
  > = {
    tecnico: { corRoupa: '#0284c7', corChapeu: '#facc15', temChapeu: true, corPele: '#fed7aa' },
    amigo_festa: { corRoupa: '#ec4899', corChapeu: '#8b5cf6', temChapeu: false, corPele: '#fde68a' },
    cobrador_luz: { corRoupa: '#dc2626', corChapeu: '#1e293b', temChapeu: true, corPele: '#fecaca' },
    vendedor_shopping: { corRoupa: '#7c3aed', corChapeu: '#f43f5e', temChapeu: false, corPele: '#fde68a' },
    mecanico: { corRoupa: '#334155', corChapeu: '#ea580c', temChapeu: true, corPele: '#fed7aa' },
    chefe: { corRoupa: '#0f172a', corChapeu: '#0f172a', temChapeu: false, corPele: '#fde68a' },
    caixa_mercado: { corRoupa: '#16a34a', corChapeu: '#15803d', temChapeu: true, corPele: '#fed7aa' },
    dentista: { corRoupa: '#ffffff', corChapeu: '#38bdf8', temChapeu: true, corPele: '#fde68a' },
    streaming_bot: { corRoupa: '#4f46e5', corChapeu: '#ef4444', temChapeu: false, corPele: '#c7d2fe' },
    diretora_escola: { corRoupa: '#0d9488', corChapeu: '#0f766e', temChapeu: false, corPele: '#fde68a' },
    encanador: { corRoupa: '#2563eb', corChapeu: '#dc2626', temChapeu: true, corPele: '#fed7aa' },
    comprador_web: { corRoupa: '#059669', corChapeu: '#10b981', temChapeu: false, corPele: '#fde68a' },
    entregador: { corRoupa: '#e11d48', corChapeu: '#e11d48', temChapeu: true, corPele: '#fed7aa' },
    esteticista: { corRoupa: '#db2777', corChapeu: '#f472b6', temChapeu: false, corPele: '#fde68a' },
    barbeiro: { corRoupa: '#1e293b', corChapeu: '#b91c1c', temChapeu: false, corPele: '#fed7aa' },
    agente_viagem: { corRoupa: '#0891b2', corChapeu: '#facc15', temChapeu: true, corPele: '#fde68a' },
    assistente_social: { corRoupa: '#059669', corChapeu: '#047857', temChapeu: false, corPele: '#fed7aa' },
  };

  const visual = config[tipo] || config.cobrador_luz;

  return (
    <div className="relative inline-block">
      <svg viewBox="0 0 100 115" className="w-18 h-20 sm:w-22 sm:h-24 overflow-visible animate-char-bounce">
        <rect
          x="22"
          y="64"
          width="56"
          height="44"
          rx="14"
          fill={visual.corRoupa}
          stroke="#0f172a"
          strokeWidth="3.5"
        />
        <polygon points="46,64 54,64 52,92 48,92" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
        <circle cx="50" cy="39" r="23" fill={visual.corPele} stroke="#0f172a" strokeWidth="3.5" />

        {visual.temChapeu ? (
          <>
            <path d="M 25 30 Q 28 10 50 10 Q 72 10 75 30 Z" fill={visual.corChapeu} stroke="#0f172a" strokeWidth="3.2" />
            <rect x="20" y="26" width="60" height="7" rx="3.5" fill={visual.corChapeu} stroke="#0f172a" strokeWidth="3.2" />
          </>
        ) : (
          <path d="M 27 33 Q 30 12 50 13 Q 70 12 73 33 Q 60 22 50 25 Q 38 22 27 33 Z" fill="#1e293b" stroke="#0f172a" strokeWidth="3.2" />
        )}

        <circle cx="41" cy="39" r="2.8" fill="#0f172a" />
        <circle cx="59" cy="39" r="2.8" fill="#0f172a" />
        <line x1="35" y1="32" x2="45" y2="34" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
        <line x1="55" y1="34" x2="65" y2="32" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M 41 49 Q 50 56 59 49" fill="#ffffff" stroke="#0f172a" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ============================================================================
// PALCO VISUAL 2D COMPLETO (FAMÍLIA SILVA, JOVEM SOLO H/M OU FAMÍLIA GRANDE)
// ============================================================================

export const PalcoSalaFamilia: React.FC<PalcoSalaFamiliaProps> = ({
  modoJogo,
  generoPersonagem,
  humor,
  saldoAtual,
  felicidadeFamilia,
  mesNome,
  npcAtivo,
  falaFamilia,
  jurosCobradosNoMes = 0,
  particulas,
  modoCompacto = false,
}) => {
  const [textoDigitado, setTextoDigitado] = useState('');

  useEffect(() => {
    if (!npcAtivo?.fala) {
      setTextoDigitado('');
      return;
    }
    setTextoDigitado('');
    const textoCompleto = npcAtivo.fala;
    let indice = 0;
    const timer = window.setInterval(() => {
      indice += 2;
      if (indice >= textoCompleto.length) {
        setTextoDigitado(textoCompleto);
        window.clearInterval(timer);
      } else {
        setTextoDigitado(textoCompleto.slice(0, indice));
      }
    }, 16);

    return () => window.clearInterval(timer);
  }, [npcAtivo?.fala, npcAtivo?.tituloEvento]);

  const corParede =
    humor === 'feliz'
      ? 'from-amber-50 via-orange-50/70 to-amber-100/80'
      : humor === 'preocupado'
      ? 'from-stone-200 via-amber-100/70 to-stone-200'
      : 'from-slate-900 via-rose-950/90 to-slate-900';

  const corChao =
    humor === 'panico' ? 'bg-amber-950 border-t-3 border-slate-900' : 'bg-amber-700 border-t-3 border-slate-900';

  const rotuloModo =
    modoJogo === 'familia'
      ? 'Família Silva (3 pessoas)'
      : modoJogo === 'familia_grande'
      ? 'Família Grande (5 pessoas)'
      : generoPersonagem === 'mulher'
      ? 'Jovem Solo (Mulher)'
      : 'Jovem Solo (Homem)';

  return (
    <div className="arcade-card rounded-2xl overflow-hidden bg-slate-900 relative select-none">
      {/* CENÁRIO DA SALA DE ESTAR 2D */}
      <div
        className={`relative w-full ${
          modoCompacto ? 'min-h-[255px]' : 'min-h-[295px] sm:min-h-[330px]'
        } bg-gradient-to-b ${corParede} flex flex-col justify-between transition-colors duration-500 overflow-hidden`}
      >
        {humor === 'panico' && (
          <div className="absolute inset-0 bg-red-600/10 animate-pulse pointer-events-none z-0" />
        )}

        {/* ELEMENTOS DE PAREDE E TETO */}
        <div className="relative z-10 flex items-start justify-between px-4 sm:px-7 pt-3">
          {/* Janela da Sala */}
          <div className="w-22 sm:w-28 h-18 sm:h-22 rounded-xl border-3 border-slate-900 overflow-hidden shadow-[3px_3px_0px_0px_#0f172a] relative bg-sky-300 shrink-0">
            <div
              className={`w-full h-full transition-colors duration-500 ${
                humor === 'feliz'
                  ? 'bg-sky-200'
                  : humor === 'preocupado'
                  ? 'bg-amber-200'
                  : 'bg-slate-800'
              }`}
            >
              {humor === 'feliz' && (
                <div className="w-6 h-6 rounded-full bg-amber-300 border-2 border-slate-900 absolute top-2 right-3" />
              )}
              {humor === 'preocupado' && (
                <div className="w-6 h-6 rounded-full bg-orange-400 border-2 border-slate-900 absolute top-4 right-3" />
              )}
              {humor === 'panico' && (
                <div className="w-5 h-5 rounded-full bg-slate-400 border-2 border-slate-900 absolute top-2 right-3" />
              )}
            </div>
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-slate-900" />
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-slate-900" />
          </div>

          {/* Luminária de Teto + Placa de Status */}
          <div className="flex flex-col items-center">
            <div className="w-1 h-4 bg-slate-900" />
            <div
              className={`px-3.5 py-1 rounded-b-xl border-2 border-slate-900 text-xs font-bold tracking-wide shadow-[2px_2px_0px_0px_#0f172a] text-center ${
                humor === 'feliz'
                  ? 'bg-amber-200 text-slate-900'
                  : humor === 'preocupado'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {humor === 'feliz'
                ? rotuloModo
                : humor === 'preocupado'
                ? 'Contas no limite'
                : 'No cheque especial'}
            </div>
          </div>

          {/* Quadro na Parede */}
          <div
            className={`hidden sm:flex flex-col items-center justify-center w-28 h-16 bg-emerald-100 border-3 border-slate-900 rounded-lg shadow-[3px_3px_0px_0px_#0f172a] transition-transform duration-300 ${
              humor === 'panico' ? 'rotate-6 bg-rose-100' : humor === 'preocupado' ? '-rotate-2' : 'rotate-0'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-700 text-center px-1 truncate max-w-full">
              {mesNome || 'Sala de casa'}
            </span>
            <div className="flex items-center gap-1 mt-0.5 text-xs font-bold text-slate-900">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-600" />
              <span>{felicidadeFamilia}%</span>
            </div>
          </div>
        </div>

        {/* TEIA DE ARANHA E GOTEIRA QUANDO ENDIVIDADO */}
        {humor === 'panico' && (
          <>
            <svg
              viewBox="0 0 80 80"
              className="w-18 h-18 absolute top-0 right-0 text-slate-400/60 pointer-events-none z-10"
            >
              <line x1="80" y1="0" x2="0" y2="20" stroke="currentColor" strokeWidth="1.8" />
              <line x1="80" y1="0" x2="15" y2="55" stroke="currentColor" strokeWidth="1.8" />
              <line x1="80" y1="0" x2="55" y2="80" stroke="currentColor" strokeWidth="1.8" />
              <path d="M 55 8 Q 48 25 65 40" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M 30 14 Q 28 40 58 65" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>

            <div className="absolute top-6 left-1/3 z-20 pointer-events-none flex flex-col items-center">
              <div className="w-2.5 h-3.5 rounded-full bg-sky-400 border-2 border-slate-900 animate-drip" />
            </div>
          </>
        )}

        {/* BALÃO DE FALA DO(S) PERSONAGEM(NS) NA SALA */}
        {falaFamilia && !npcAtivo && (
          <div className="relative z-20 mx-auto my-1 max-w-md px-4 py-2 rounded-xl bg-white border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] text-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-800">{falaFamilia}</p>
          </div>
        )}

        {/* AVISO DE JUROS QUANDO COBRA CHEQUE ESPECIAL */}
        {(saldoAtual < 0 || jurosCobradosNoMes > 0) && (
          <div className="absolute top-14 right-3 sm:right-6 z-20 bg-rose-600 text-white px-3 py-1.5 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] flex items-center gap-2 animate-monster">
            <AlertCircle className="w-4 h-4 text-amber-200 shrink-0" />
            <div className="text-[11px] leading-tight font-bold">
              <div>Juros do cheque especial (8% a.m.)</div>
              {jurosCobradosNoMes > 0 && (
                <div className="text-amber-200 font-mono">
                  Descontou -R$ {jurosCobradosNoMes} neste mês
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARTÍCULAS FLUTUANTES */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {particulas.map((p) => {
            const classesCor =
              p.cor === 'verde'
                ? 'bg-emerald-400 text-slate-950'
                : p.cor === 'vermelho'
                ? 'bg-rose-500 text-white'
                : p.cor === 'rosa'
                ? 'bg-rose-400 text-white'
                : p.cor === 'amarelo'
                ? 'bg-amber-300 text-slate-950'
                : 'bg-sky-300 text-slate-950';

            return (
              <div
                key={p.id}
                style={{ left: `${p.xPercent}%`, top: `${p.yPercent}%` }}
                className={`absolute animate-float-up px-2.5 py-1 rounded-lg border-2 border-slate-900 font-mono font-bold text-xs sm:text-sm shadow-[2px_2px_0px_0px_#0f172a] whitespace-nowrap ${classesCor}`}
              >
                {p.texto}
              </div>
            );
          })}
        </div>

        {/* PALCO DOS PERSONAGENS: FAMÍLIA SILVA (4), FAMÍLIA GRANDE (6) OU JOVEM SOLO (1) */}
        <div className="relative z-10 mt-auto pt-4 px-2 sm:px-8 flex flex-col items-center">
          <div className="relative flex items-end justify-center gap-1.5 sm:gap-3 w-full max-w-2xl">
            {/* Sofá da Sala atrás */}
            <div className="absolute bottom-2 inset-x-4 h-16 sm:h-20 bg-rose-500 border-3 border-slate-900 rounded-2xl shadow-[3px_3px_0px_0px_#0f172a] -z-10" />
            <div className="absolute bottom-2 left-1 w-8 h-14 bg-rose-600 border-3 border-slate-900 rounded-xl -z-10" />
            <div className="absolute bottom-2 right-1 w-8 h-14 bg-rose-600 border-3 border-slate-900 rounded-xl -z-10" />

            {modoJogo === 'familia' && (
              <>
                <div className="flex flex-col items-center">
                  <PersonagemPaiSVG humor={humor} />
                  <span className="-mt-2 px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-semibold">
                    Pai
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemMaeSVG humor={humor} />
                  <span className="-mt-2 px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-semibold">
                    Mãe
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemFilhoSVG humor={humor} />
                  <span className="-mt-2 px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px] font-semibold">
                    Filho
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <CachorrinhoCarameloSVG humor={humor} />
                  <span className="-mt-1 px-2 py-0.5 rounded bg-amber-300 border border-slate-900 text-slate-950 font-mono text-[10px] font-bold">
                    Caramelo
                  </span>
                </div>
              </>
            )}

            {modoJogo === 'familia_grande' && (
              <>
                <div className="flex flex-col items-center">
                  <PersonagemVovoSVG humor={humor} />
                  <span className="-mt-2 px-1.5 py-0.5 rounded bg-teal-900 text-amber-100 font-mono text-[9px] sm:text-[10px] font-semibold">
                    Vovó
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemPaiSVG humor={humor} compacto />
                  <span className="-mt-2 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] sm:text-[10px] font-semibold">
                    Pai
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemMaeSVG humor={humor} compacto />
                  <span className="-mt-2 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] sm:text-[10px] font-semibold">
                    Mãe
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemFilhaSVG humor={humor} />
                  <span className="-mt-2 px-1.5 py-0.5 rounded bg-pink-900 text-pink-100 font-mono text-[9px] sm:text-[10px] font-semibold">
                    Filha
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <PersonagemFilhoSVG humor={humor} compacto />
                  <span className="-mt-2 px-1.5 py-0.5 rounded bg-slate-900 text-white font-mono text-[9px] sm:text-[10px] font-semibold">
                    Filho
                  </span>
                </div>

                <div className="flex flex-col items-center">
                  <CachorrinhoCarameloSVG humor={humor} compacto />
                  <span className="-mt-1 px-1.5 py-0.5 rounded bg-amber-300 border border-slate-900 text-slate-950 font-mono text-[9px] sm:text-[10px] font-bold">
                    Caramelo
                  </span>
                </div>
              </>
            )}

            {modoJogo === 'individual' && (
              <div className="flex flex-col items-center py-1">
                {generoPersonagem === 'mulher' ? (
                  <>
                    <PersonagemSoloMulherSVG humor={humor} />
                    <span className="-mt-2 px-3 py-0.5 rounded-md bg-pink-600 border-2 border-slate-900 text-white font-mono text-xs font-bold">
                      Jovem (Mulher)
                    </span>
                  </>
                ) : (
                  <>
                    <PersonagemSoloHomemSVG humor={humor} />
                    <span className="-mt-2 px-3 py-0.5 rounded-md bg-sky-600 border-2 border-slate-900 text-white font-mono text-xs font-bold">
                      Jovem (Homem)
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Chão de Madeira e Tapete */}
          <div className={`w-full h-6 -mx-10 mt-1 ${corChao} flex items-center justify-center`}>
            <div className="w-3/5 h-2.5 rounded-full bg-teal-600 border border-slate-900" />
          </div>
        </div>
      </div>

      {/* CAIXA DE DIÁLOGO DO VISITANTE */}
      {npcAtivo && (
        <div className="bg-slate-900 border-t-3 border-slate-900 p-4 sm:p-5 text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="shrink-0 flex flex-col items-center bg-amber-50 p-2 rounded-xl border-2 border-slate-950">
              <AvatarNPCSVG tipo={npcAtivo.tipo} />
              <span className="mt-1 px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[10px] font-bold">
                {npcAtivo.nome}
              </span>
            </div>

            <div
              onClick={() => setTextoDigitado(npcAtivo.fala)}
              title="Clique para mostrar todo o texto"
              className="flex-1 w-full bg-white text-slate-900 rounded-xl border-2 border-slate-950 p-4 cursor-pointer space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1.5">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-display font-bold text-sm sm:text-base text-slate-900">
                    {npcAtivo.tituloEvento}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {npcAtivo.cargo} · {npcAtivo.categoria}
                </span>
              </div>

              <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed min-h-[2.75rem]">
                “{textoDigitado}”
                {textoDigitado.length < npcAtivo.fala.length && (
                  <span className="inline-block w-1.5 h-4 bg-slate-900 ml-1 animate-pulse" />
                )}
              </p>

              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                <span>Escolha uma das opções abaixo para decidir como lidar com isso:</span>
                <span className="text-emerald-700 font-semibold">Sua vez</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
