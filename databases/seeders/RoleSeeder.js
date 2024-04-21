import Role from "./../../app/models/Role.js";
import Permission from "../../app/models/Permission.js";

export default class RoleSeeder {
  static async run() {
    let roles = [
      {
        name: "super",
        display_name: "Super Administrator",
        permissions: [{ name: "sudo", display_name: "Super Permission" }],
      },
      {
        name: "admin",
        display_name: "Administrator",
        permissions: [
          { name: "read-user", display_name: "Read User" },
          { name: "read-room", display_name: "Read Room" },
          { name: "read-quiz", display_name: "Read Quiz" },
        ],
      },
      {
        name: "user",
        display_name: "User",
        permissions: [
          { name: "read-room", display_name: "Read Room" },
          { name: "create-room", display_name: "Create Room" },
          { name: "update-room", display_name: "Update Room" },
          { name: "delete-room", display_name: "Delete Room" },

          { name: "read-quiz", display_name: "Read Quiz" },
          { name: "create-quiz", display_name: "Create Quiz" },
          { name: "update-quiz", display_name: "Update Quiz" },
          { name: "delete-quiz", display_name: "Delete Quiz" },
        ],
      },
    ];

    try {
      for (const role of roles) {
        let data = {
          name: role.name,
          display_name: role.display_name,
        };

        let new_role = await Role.where(data);

        if (!new_role[0]) {
          new_role = await Role.create(data);
        } else {
          new_role = new_role[0];
        }

        for (const permission of role.permissions) {
          let p = await Permission.where({ name: permission.name });

          if (!p[0]) {
            p = await Permission.create(permission);
          } else {
            p = p[0];
          }

          new_role.attachPermissions([p.id]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
