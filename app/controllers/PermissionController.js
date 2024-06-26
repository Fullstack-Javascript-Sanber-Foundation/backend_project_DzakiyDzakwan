import can from "../../helpers/can.js";
import Permission from "./../models/Permission.js";

export default class PermissionController {
  static async index(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "read-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let data = await Permission.all();

      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async show(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "read-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let id = parseInt(req.params.id);
      let data = await Permission.findOrFail(id);

      await data.users();
      await data.roles();

      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async store(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "create-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let data = await Permission.create(req.body);

      return res.status(201).send({ message: "create success", data });
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async update(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "update-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let id = parseInt(req.params.id);
      let permission = await Permission.findOrFail(id);

      let data = await permission.update(req.body);

      return res.status(201).send({ message: "update success", data });
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async destroy(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "delete-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let id = parseInt(req.params.id);
      let permission = await Permission.findOrFail(id);

      let data = await permission.delete();

      return res.status(200).send({ message: "delete success" });
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async users(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "read-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let id = parseInt(req.params.id);
      let permission = await Permission.findOrFail(id);

      let data = await permission.users();

      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }

  static async roles(req, res) {
    if (
      !(await can(req.user, ["sudo", "super-permission", "read-permission"]))
    ) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    let id = parseInt(req.params.id);
    try {
      let permission = await Permission.findOrFail(id);

      let data = await permission.roles();

      return res.status(200).send(data);
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }
}
