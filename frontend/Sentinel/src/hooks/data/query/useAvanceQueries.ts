import { useQuery } from "@tanstack/react-query";
import { getCatalogs, getConcepts, getPartidas } from "../api/avanceApi";

export const useFetchCatalogs = () => useQuery({
  queryKey: ["catalogs"],
  queryFn: getCatalogs
});

export const useFetchPartidas = () => useQuery({
  queryKey: ["partidas"],
  queryFn: getPartidas
})

export const useFetchConcepts = () => useQuery({
  queryKey: ['concepts'],
  queryFn: getConcepts
})
