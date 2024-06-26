import can from "../../helpers/can.js";
import Quiz from "../models/Quiz.js";
import Room from "../models/Room.js";

export default class RoomController {
  static async index(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "read-room"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let data = await Room.all();

      return res.status(200).send(data);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async show(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "read-room"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let data = await Room.findOrFail(req.params.code);

      let user = req.user;
      let master = await data.master();
      let participants = await data.participants();
      await data.quizzes();

      let is_master = master.id === user.id;
      let is_participant = participants.find(
        (participant) => participant.id === user.id
      );
      let is_admin = await user.hasRoles(["super", "admin"]);

      if (!is_master && !is_participant && !is_admin)
        return res.status(500).send({
          errors: "anda tidak memiliki hak akses terhadap ruangan ini",
        });

      return res.status(200).send(data);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async store(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "create-room"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    let payload = {
      room_master: req.user.id,
      name: req.body.name,
    };

    try {
      let data = await Room.create(payload);

      return res.status(201).send({ message: "create success", data });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async update(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "update-room"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let data = await room.update(req.body);

      return res.status(201).send({ message: "update success", data });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async destroy(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "delete-room"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let data = await room.delete();

      return res.status(200).send({ message: "delete success" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async participants(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "read-participants"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let data = await room.participants();

      let user = req.user;
      let master = await data.master();

      let is_master = master.id === user.id;
      let is_participant = data.find(
        (participant) => participant.id === user.id
      );

      let is_admin = await user.hasRoles(["super", "admin"]);

      if (!is_master && !is_participant && !is_admin)
        return res.status(500).send({
          errors: "anda tidak memiliki hak akses terhadap ruangan ini",
        });

      return res.status(200).send(data);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async join(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "create-participants"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.body.room_code);

      let participants = await room.participants();

      let user = req.user;

      if (room.room_master === user.id) {
        return res.status(403).send({
          errors: "room master tidak bisa bergabung menjadi peserta ruangan",
        });
      }

      if (participants.some((participant) => participant.id === user.id)) {
        return res.status(403).send({
          errors: "anda sudah menjadi peserta didalam ruangan ini",
        });
      }

      //   Get user_id from header
      let data = await room.addParticipant(user.id);

      return res.status(200).send({ message: "berhasil bergabung ke ruangan" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async quit(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "delete-participants"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let user = req.user;

      let participants = await room.participants();

      let is_participant = participants.find(
        (participant) => participant.id === req.body.user_id
      );

      //   Get user_id from header
      let data = room.removeParticipant(req.body.user_id);

      return res.status(200).send({ message: "berhasil keluar ruangan" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async removeParticipant(req, res) {
    if (!(await can(req.user, ["sudo", "super-room", "delete-participants"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let data = room.removeParticipant(req.body.user_id);

      return res.status(200).send({ message: "berhasil menghapus peserta" });
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async quizzes(req, res) {
    if (!(await can(req.user, ["sudo", "read-room", "read-participants"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    try {
      let room = await Room.findOrFail(req.params.code);

      let data = await room.quizzes();

      let user = req.user;
      let master = await data.master();
      let participants = await data.participants();

      let is_master = master.id === user.id;
      let is_participant = participants.find(
        (participant) => participant.id === user.id
      );
      let is_admin = await user.hasRoles(["super", "admin"]);

      if (!is_master && !is_participant && !is_admin)
        return res.status(500).send({
          errors: "anda tidak memiliki hak akses terhadap ruangan ini",
        });

      return res.status(200).send(data);
    } catch (error) {
      console.log(error);
      return res.status(400).send({ errors: error.message });
    }
  }

  static async addQuiz(req, res) {
    if (!(await can(req.user, ["sudo", "super-quiz", "create-quiz"]))) {
      return res
        .status(403)
        .send({ errors: "anda tidak memiliki hak akses untuk endpoint ini" });
    }

    let payload = {
      user_id: req.user.id,
      room_code: req.params.code,
      ...req.body,
    };

    try {
      let data = await Quiz.create(payload);

      return res.status(201).send({ message: "create success", data });
    } catch (error) {
      return res.status(400).send({ errors: error.message });
    }
  }
}
