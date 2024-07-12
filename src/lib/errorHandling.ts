import { AxiosError } from "axios"
import { tryStringifyJson } from "./converters"

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function makeShortErrorMessage(err: unknown) {
  if (err instanceof AxiosError && err.response) {
    return `${err.response?.status} ${err.response?.statusText}: ${JSON.stringify(err.response?.data)}`
  } else if (err instanceof Error) {
    return err.message
  } else {
    return `Unexpected error: ${err}`
  }
}

export function makeErrorMessage(err: unknown) {
  if (err instanceof AxiosError && err.response) {
    return `${err.response?.status} ${err.response?.statusText} from ${err.response?.config.url}: ${JSON.stringify(err.response?.data)}`
  } else if (err instanceof Error) {
    return err.message
  } else {
    return `Unexpected error: ${tryStringifyJson(err) || err}`
  }
}
