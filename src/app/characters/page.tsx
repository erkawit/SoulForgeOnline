'use client';
import dynamic from 'next/dynamic';
const CharacterStudio=dynamic(()=>import('@/components/CharacterStudio'),{ssr:false});
export default function Page(){return <CharacterStudio/>;}
