const { communityModel, roleModel, memberModel } = require('../models');
const { addMember } = require('./member');

const createCommunity = async (req, res) => {
  try {
    const {
      name,
      userData: { _id: owner },
    } = req.body;

    if (!req.body)
      return res
        .status(500)
        .send({ status: false, Error: 'Please provide mandatory fields' });

    const slug = name.toLowerCase();

    const community = await communityModel.create({ name, slug, owner });

    const roleData = await roleModel.findOne({ name: 'Community Admin' }) // finding id of community admin role //

    await memberModel.create({ user: owner, community: community._id, role: roleData._id }) // after creating community first member should be added as community admin //

    const { __v, ...communityData } = community['_doc'];
    return res
      .status(201)
      .send({ status: true, content: { data: communityData } });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};


const allCommunity = async (req, res) => {
  try {
    const PAGE_SIZE = 10;
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const communities = await communityModel
      .find()
      .populate({ path: 'owner', model: 'user', select: '_id name' })
      .select({ __v: 0 })
      .skip(startIndex)
      .limit(PAGE_SIZE);

    if (!communities.length) {
      return res
        .status(404)
        .send({ status: false, Error: 'Communities not found' });
    }
    const totalCount = communities.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const meta = {
      total: totalCount,
      pages: totalPages,
      page: currentPage,
    };

    return res
      .status(200)
      .send({ status: true, content: { meta, data: communities } });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const PAGE_SIZE = 10;
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const communityData = await communityModel.findOne({ name: { $regex: new RegExp('^' + id + '$', 'i') } });

    const membersData = await memberModel
      .find({ community: communityData._id })
      .populate({ path: 'user', model: 'user', select: '_id name' })
      .populate({ path: 'role', model: 'role', select: '_id name' })
      .select({ updatedAt: 0, __v: 0 })
      .skip(startIndex)
      .limit(PAGE_SIZE);

    if (!membersData.length) {
      return res
        .status(404)
        .send({ status: false, Error: 'Communities not found' });
    }
    const totalCount = membersData.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const meta = {
      total: totalCount,
      pages: totalPages,
      page: currentPage,
    };

    return res
      .status(200)
      .send({ status: true, content: { meta, data: membersData } });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

const myOwnedCommunity = async (req, res) => {
  try {
    const {userData: { _id: owner },} = req.body;

    const PAGE_SIZE = 10;
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const communities = await communityModel
      .find({owner})
      .select({ __v: 0 })
      .skip(startIndex)
      .limit(PAGE_SIZE);

    if (!communities.length) {
      return res
        .status(404)
        .send({ status: false, Error: 'Communities not found' });
    }
    const totalCount = communities.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const meta = {
      total: totalCount,
      pages: totalPages,
      page: currentPage,
    };

    return res
      .status(200)
      .send({ status: true, content: { meta, data: communities } });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

const myJoinedCommunity = async (req, res) => {
  try {
    const { userData: { _id: user }, } = req.body;

    const PAGE_SIZE = 10;
    const currentPage = req.query.page ? parseInt(req.query.page) : 1;
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    const memberData = await memberModel.find({ user }).populate({
      path: 'community',
      populate: {
        path: 'owner',
        select: '_id name'
      }
    })

    // Extract community data from memberData
    const communityData = memberData.map(member => {
      return {
        _id: member.community._id,
        name: member.community.name,
        slug: member.community.slug,
        owner: { _id: member.community.owner._id, name: member.community.owner.name },
        createdAt: member.community.createdAt,
        updatedAt: member.community.updatedAt
      };
    });

    const totalCount = communityData.length;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    // Slice communityData array to return only the data for the current page
    const paginatedData = communityData.slice(startIndex, startIndex + PAGE_SIZE);

    const meta = {
      total: totalCount,
      pages: totalPages,
      page: currentPage,
    };

    return res
      .status(200)
      .send({ status: true, content: { meta, data: paginatedData } });
  } catch (error) {
    return res.status(500).send({ status: false, Error: error.message });
  }
};

module.exports = { createCommunity, allCommunity, getAllMembers, myOwnedCommunity ,myJoinedCommunity};
