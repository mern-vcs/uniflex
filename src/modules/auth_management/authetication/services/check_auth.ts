import { FastifyReply, FastifyRequest } from 'fastify';
import { anyObject } from '../../../../common_types/object';
import db from '../../user_management/models/db';
import { env } from 'process';

const check_auth = async (request: FastifyRequest, reply: FastifyReply) => {
    const secretKey = env.JTI;
    const jwt = require('jsonwebtoken');
    // const token = request.headers.authorization;
    const token = request.cookies.token;
    const user_agent = request.headers['user-agent'];

    if (!token || !token.startsWith('Bearer ')) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
    }

    try {
        const decoded = jwt.verify(token.slice(7), secretKey);
        let models = await db();
        let user = await models.UserModel.findByPk(decoded.id);
        if (
            user &&
            user.token == decoded.token &&
            decoded.user_agent == user_agent
        ) {
            (request as anyObject).user = user;
            return;
        } else {
            reply.code(401).send({ error: 'Unauthorized' });
            return;
        }
    } catch (error) {
        reply.code(401).send({ error: 'Unauthorized' });
        return;
    }
};

export default check_auth;
