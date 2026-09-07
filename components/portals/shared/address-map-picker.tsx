"use client"

import { useCallback, useRef, useState } from "react"
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api"

const LIBRARIES: "places"[] = ["places"]
const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 } // Johannesburg

export type LocationValue = {
  address: string
  latitude: number | null
  longitude: number | null
}

export function AddressMapPicker({
  value,
  onChange,
}: {
  value: LocationValue
  onChange: (value: LocationValue) => void
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: LIBRARIES,
  })

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [center, setCenter] = useState(
    value.latitude && value.longitude
      ? { lat: value.latitude, lng: value.longitude }
      : DEFAULT_CENTER
  )

  const handlePlaceChanged = useCallback(() => {
    const place = autocompleteRef.current?.getPlace()
    if (!place?.geometry?.location) return

    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()

    setCenter({ lat, lng })
    onChange({
      address: place.formatted_address ?? place.name ?? value.address,
      latitude: lat,
      longitude: lng,
    })
  }, [onChange, value.address])

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      const lat = e.latLng?.lat()
      const lng = e.latLng?.lng()
      if (lat == null || lng == null) return

      setCenter({ lat, lng })

      // Reverse geocode so the address text stays in sync with the pin
      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        onChange({
          address:
            status === "OK" && results?.[0]
              ? results[0].formatted_address
              : value.address,
          latitude: lat,
          longitude: lng,
        })
      })
    },
    [onChange, value.address]
  )

  if (!isLoaded) {
    return (
      <div className="flex h-48 items-center justify-center rounded-md border border-border text-sm text-muted-foreground">
        Loading map…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Autocomplete
        onLoad={(ac) => (autocompleteRef.current = ac)}
        onPlaceChanged={handlePlaceChanged}
        options={{ componentRestrictions: { country: "za" } }}
      >
        <input
          type="text"
          defaultValue={value.address}
          placeholder="Start typing an address…"
          className="w-full border-none bg-transparent px-0 py-1 text-[15px] text-foreground shadow-none outline-none placeholder:text-muted-foreground/50"
        />
      </Autocomplete>

      <div className="overflow-hidden rounded-md border border-border">
        <GoogleMap
          center={center}
          zoom={value.latitude ? 15 : 11}
          mapContainerStyle={{ width: "100%", height: "220px" }}
          options={{ disableDefaultUI: true, zoomControl: true }}
        >
          {value.latitude && value.longitude && (
            <Marker
              position={{ lat: value.latitude, lng: value.longitude }}
              draggable
              onDragEnd={handleMarkerDragEnd}
            />
          )}
        </GoogleMap>
      </div>

      <p className="text-xs text-muted-foreground">
        Search an address, or drag the pin to fine-tune the exact spot.
      </p>
    </div>
  )
}
