/**
 * Seed development database with a team and user so you can sign in locally
 * with email (magic link). Only runs when NODE_ENV=development and no team exists.
 * Also ensures every team has at least one AuthenticationProvider (required by startup).
 *
 * Run after migrations: node build/server/scripts/seed-dev.js
 * Or: yarn seed:dev
 */
import "./bootstrap";
import { v4 as uuidv4 } from "uuid";
import env from "@server/env";
import { sequelize } from "@server/database/sequelize";
import { Team, User, AuthenticationProvider } from "@server/models";

const DEV_EMAIL = "dev@example.com";
const DEV_TEAM_NAME = "Outline";

async function ensureTeamHasAuthProvider(team: Team) {
  const count = await AuthenticationProvider.count({
    where: { teamId: team.id },
  });
  if (count === 0) {
    await AuthenticationProvider.create({
      teamId: team.id,
      name: "email",
      providerId: uuidv4(),
      enabled: true,
    });
    console.log("Añadido AuthenticationProvider al equipo (requerido por Outline).");
  }
}

async function seedDev() {
  if (env.ENVIRONMENT !== "development") {
    console.log("seed-dev: Skipping (solo para NODE_ENV=development)");
    process.exit(0);
    return;
  }

  await sequelize.authenticate();

  const existingTeam = await Team.scope("withAuthenticationProviders").findOne();
  if (existingTeam) {
    await ensureTeamHasAuthProvider(existingTeam);
    const user = await User.findOne({
      where: { teamId: existingTeam.id, email: DEV_EMAIL },
    });
    if (user) {
      console.log("Ya existe equipo y usuario de desarrollo.");
      console.log("  Inicia sesión con email:", DEV_EMAIL);
      console.log("  En la pantalla de login elige 'Sign in with Email' y usa ese email.");
      console.log("  El enlace mágico aparecerá en la consola del servidor (yarn dev).");
    } else {
      console.log("Ya existe un equipo. Creando usuario de desarrollo:", DEV_EMAIL);
      await User.create({
        teamId: existingTeam.id,
        email: DEV_EMAIL,
        name: "Dev User",
        username: "dev",
        isAdmin: true,
      });
      console.log("Usuario creado. Inicia sesión con email:", DEV_EMAIL);
    }
    process.exit(0);
    return;
  }

  const team = await Team.create({
    name: DEV_TEAM_NAME,
    guestSignin: true,
    subdomain: null,
    domain: null,
  });

  await AuthenticationProvider.create({
    teamId: team.id,
    name: "email",
    providerId: uuidv4(),
    enabled: true,
  });

  await User.create({
    teamId: team.id,
    email: DEV_EMAIL,
    name: "Dev User",
    username: "dev",
    isAdmin: true,
  });

  console.log("Desarrollo seed listo.");
  console.log("  Equipo:", DEV_TEAM_NAME, "(guestSignin = true)");
  console.log("  Usuario:", DEV_EMAIL);
  console.log("");
  console.log("Para entrar:");
  console.log("  1. Arranca el servidor: yarn dev");
  console.log("  2. Abre http://localhost:3000");
  console.log("  3. Elige 'Sign in with Email' e introduce:", DEV_EMAIL);
  console.log("  4. El enlace mágico se mostrará en la consola donde corre yarn dev.");
  process.exit(0);
}

seedDev().catch((err) => {
  console.error("Error en seed-dev:", err);
  process.exit(1);
});
