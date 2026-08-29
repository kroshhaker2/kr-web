{
  description = "SolidJS development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];

      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = import nixpkgs {
            inherit system;
          };

          node = pkgs.nodejs_24;

          pnpm = pkgs.pnpm_10.override {
            nodejs = node;
          };
        in
        {
          default = pkgs.mkShell {
            packages = [
              node
              pnpm
            ];

            shellHook = ''
              echo "Node: $(node --version)"
              echo "pnpm: $(pnpm --version)"
            '';
          };
        }
      );
    };
}
