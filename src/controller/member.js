const { userModel, communityModel, roleModel, memberModel } = require('../models');

const addMember = async (req, res) => {
    try {
        const { community, user, role } = req.body;

        if (!req.body)
            return res
                .status(500)
                .send({ status: false, Error: 'Please provide mandatory fields' });

        const communityExist = await communityModel.findById(community)
        if (!communityExist) return res.status(404).send({ status: false, Error: "Community not found" })

        const userExist = await userModel.findById(user)
        if (!userExist) return res.status(404).send({ status: false, Error: "User not found" })

        const roleExist = await roleModel.findById(role)
        if (!roleExist) return res.status(404).send({ status: false, Error: "Role not found" })

        const loggedinUser = req.body['userData']._id

        const memberExist = await memberModel.findOne({ community, user });
        if (memberExist) {
            return res
                .status(409)
                .send({ status: false, Error: 'Member already exists in the community' });
        }
        const roleData = await roleModel.findOne({ name: 'Community Admin' }) // finding id of community admin role //

        const memberData = await memberModel.findOne({ community, user: loggedinUser, role: roleData._id }); // fetch the data of loggedin user with admin role if data not found means loggedin user is not admin //
        if (!memberData) {
            return res
                .status(409)
                .send({ status: false, Error: 'Unauthorised to add member' });
        }

        const member = await memberModel.create({ user, community, role })
        const { updatedAt, __v, ...memberdata } = member._doc;
        return res
            .status(200)
            .send({ status: true, content: { data: memberdata } });
    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message });
    }
};

const removeMember = async (req, res) => {
    try {
        const { id } = req.params;

        const loggedinUser = req.body['userData']._id

        const memberExist = await memberModel.findById(id); // checking first member is exist or not if exist then fetch the data like community //
        if (!memberExist) {
            return res
                .status(409)
                .send({ status: false, Error: 'Member not exists in the community' });
        }
        const roleData = await roleModel.findOne({ name: "Community Member" }); // finding id of community member role because other two role have access //

        const memberData = await memberModel.findOne({ user: loggedinUser,community:memberExist.community,role:roleData._id }); // fetch the data of loggedin user if data found means loggedin user is member //
        if (memberData) {
            return res
                .status(409)
                .send({ status: false, Error: 'NOT_ALLOWED_ACCESS' });
        }
        
        await memberModel.deleteOne({ _id: id })

        return res
            .status(200)
            .send({ status: true });
    } catch (error) {
        return res.status(500).send({ status: false, Error: error.message });
    }
};
module.exports = { addMember, removeMember };
