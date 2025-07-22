<<<<<<< HEAD
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getCatalogs,
  getConcepts,
  getPartidas,
  submitAdvance,
} from "../api/avanceApi";
import { AdvanceRegistration } from "src/types/entities";
import { SubmitAdvance } from "src/types/avance";

export const useFetchCatalogs = () =>
  useQuery({
    queryKey: ["catalogs"],
    queryFn: getCatalogs,
  });

export const useFetchPartidas = () =>
  useQuery({
    queryKey: ["partidas"],
    queryFn: getPartidas,
  });

export const useFetchConcepts = () =>
  useQuery({
    queryKey: ["concepts"],
    queryFn: getConcepts,
  });

export const useSubmitAdvance = () =>
  useMutation({
    mutationKey: ["submitAdvance"],
    mutationFn: (advance: SubmitAdvance) => submitAdvance(advance),
  });
=======
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
>>>>>>> 43999dd (implement avance apis)
