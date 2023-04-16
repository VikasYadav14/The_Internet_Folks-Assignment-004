const { roleModel } = require('../models');

const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    let scopes
    if (name === 'Community Admin') {
      scopes = ['member-get', 'member-add', 'member-remove'];
    }
    if (name === 'Community Member') {
      scopes = ['member-get'];
    }
    if (name === 'Community Moderator') {
      scopes = ['member-get', 'member-remove'];
    }
    const Role = await roleModel.create({name,scopes});
    const { __v, ...data } = Role['_doc'];
    delete data.scopes
    return res.status(201).send({ status: true, content: { data } });
  } catch (error) {
    return res.status(500).send({ status: false,Error: error.message });
  }
};

const getAllRole = async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const role = await roleModel
      .find()
      .select({ __v: 0 })
      .skip(startIndex)
      .limit(PAGE_SIZE);

    if (!role.length) {
      return res
        .status(404)
        .send({ status: false, Error: 'ROle not found' });
    }
    const totalCount = role.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const meta = {
      total: totalCount,
      pages: totalPages,
      page: currentPage,
    };

    return res
      .status(200)
      .send({ status: true, content: { meta, data: role } });
  } catch (error) {
    return res.status(500).send({ Error: error.message });
  }
};

module.exports = { createRole, getAllRole };
