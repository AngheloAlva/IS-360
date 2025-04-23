export const VEHICLE_TYPE = {
	CAR: "CAR",
	TRUCK: "TRUCK",
	MOTORCYCLE: "MOTORCYCLE",
	BUS: "BUS",
	TRACTOR: "TRACTOR",
	TRAILER: "TRAILER",
	OTHER: "OTHER",
} as const

export const VEHICLE_TYPE_ARRAY = [
	VEHICLE_TYPE.CAR,
	VEHICLE_TYPE.TRUCK,
	VEHICLE_TYPE.MOTORCYCLE,
	VEHICLE_TYPE.BUS,
	VEHICLE_TYPE.TRACTOR,
	VEHICLE_TYPE.TRAILER,
	VEHICLE_TYPE.OTHER,
] as const

export const VehicleTypeLabels = {
	CAR: "Auto",
	TRUCK: "Camión",
	MOTORCYCLE: "Motocicleta",
	BUS: "Bus",
	TRACTOR: "Tractor",
	TRAILER: "Remolque",
	OTHER: "Otro",
} as const

export const VehicleTypeOptions = [
	{
		value: VEHICLE_TYPE.CAR,
		label: VehicleTypeLabels.CAR,
	},
	{
		value: VEHICLE_TYPE.TRUCK,
		label: VehicleTypeLabels.TRUCK,
	},
	{
		value: VEHICLE_TYPE.MOTORCYCLE,
		label: VehicleTypeLabels.MOTORCYCLE,
	},
	{
		value: VEHICLE_TYPE.BUS,
		label: VehicleTypeLabels.BUS,
	},
	{
		value: VEHICLE_TYPE.TRACTOR,
		label: VehicleTypeLabels.TRACTOR,
	},
	{
		value: VEHICLE_TYPE.TRAILER,
		label: VehicleTypeLabels.TRAILER,
	},
	{
		value: VEHICLE_TYPE.OTHER,
		label: VehicleTypeLabels.OTHER,
	},
]
