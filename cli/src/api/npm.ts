export interface NPMAPI {
  getPackage(name: string): Promise<NPMPackageResponse>;
  getPackageWithVersion(
    name: string,
    version: string,
  ): Promise<NPMPackageVersionResponse>;
}

export class NPMClient implements NPMAPI {
  endpoint = "https://registry.npmjs.org";

  constructor() {
  }

  async getPackage(name: string): Promise<NPMPackageResponse> {
    return await fetch(`${this.endpoint}/${name}`).then(async (result) => {
      return await result.json();
    });
  }

  async getPackageWithVersion(
    name: string,
    version: string,
  ): Promise<NPMPackageVersionResponse> {
    return await fetch(`${this.endpoint}/${name}/${version}`).then(
      async (result) => {
        return await result.json();
      },
    );
  }
}

interface NPMPackageVersionResponse {
  name: string;
  version: string;
  dist: {
    shasum: string;
    tarball: string;
  };
}

/** We will only make use of the keys we need */
interface NPMPackageResponse {
  name: string;
  "dist-tags": {
    latest: string;
  };
  versions: {
    [v: string]: NPMPackageVersionResponse;
  };
  //deno-lint-ignore no-explicit-any
  [k: string]: any;
}
