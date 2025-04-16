// Interface cho properties của các tỉnh thành
export interface ProvinceProperties {
	ten_tinh: string; // Tên tỉnh
	gid?: number;     // Mã tỉnh (optional)
	[key: string]: unknown; // Thay any bằng unknown
  }
  
  // Interface cho Feature của GeoJSON với properties cụ thể
  export interface MapFeature extends GeoJSON.Feature {
	properties: ProvinceProperties;
  }
  
  // Interface cho style của tỉnh
  export interface ProvinceStyle {
	color: string;
	fillColor: string;
	fillOpacity: number;
  }

  