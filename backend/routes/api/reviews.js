const express = require('express');
const { Spot, SpotImage, Review, ReviewImage, User, Booking} = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// get all reviews from current user
router.get('/current', requireAuth, async (req, res) => {
    const userId = req.user.id

    const reviews = await Review.findAll({
        include: [
            {
                model: User, as: 'User',
                attributes:
                    { exclude: ['email', 'hashedPassword', 'username', 'createdAt', 'updatedAt'] }
            },
            {
                model: Spot, as: "Spot",
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'description']
                },
                include: {
                    model: SpotImage,
                    where: { preview: true },
                    attributes: ['url']
                }
            },
            {
                model: ReviewImage, as: "ReviewImages",
                attributes:
                    { exclude: ['reviewId', 'createdAt', 'updatedAt'] }
            },

        ],
        where: {
            userId: userId
        },
    });

    for (let i = 0; i < reviews.length; i++) {
        let resPreview = reviews[i].toJSON();

        let spotImageUrl = resPreview.Spot.SpotImages[0];

        if (spotImageUrl) {
            resPreview.Spot.previewImage = spotImageUrl.url
        } else {
            resPreview.Spot.previewImage = 'No Image Available'
        }
        delete resPreview.Spot.SpotImages;
        reviews[i] = resPreview;
    };

    return res.json({ Reviews: reviews })
});



// create an image for a review
router.post('/:reviewId/images', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const { url } = req.body;
    const findReview = await Review.findByPk(reviewId);
    const userId = req.user.id;

    if (!findReview) {
        return res
            .status(404)
            .json({
                message: "Review couldn't be found",
                statusCode: res.statusCode
            })
    };

    if (findReview.userId !== userId) {
        return res
            .status(403)
            .json({
            message: "This review doesn't belong to this user",
            statusCode: 403
        })
    };

    const hasImages = await ReviewImage.findAll({
        where: { reviewId: reviewId }
    });

    if (hasImages.length >= 10) {
        return res
            .status(403)
            .json({
                message: "Maximum number of images for this resource was reached",
                statusCode: res.statusCode
            })
    };

    const addImage = await ReviewImage.create({
        url,
        reviewId: reviewId
    });

    return res.json({
        id: addImage.id,
        url: url
    });
});


// edit a review
router.put('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const findReview = await Review.findByPk(reviewId);
    const { review, stars } = req.body;

    if (!findReview) {
        return res
            .status(404)
            .json({
                message: "Review couldn't be found",
                statusCode: res.statusCode
            })
    };

    try {
        findReview.update({
            review: review,
            stars, stars
        });

        res.json( findReview )

    } catch (error) {
        return res
            .status(400)
            .json({
                "message": "Validation error",
                statusCode: res.statusCode,
                errors: {
                    review: "Review text is required",
                    stars: "Stars must be an integer from 1 to 5",
                }
            });
    };
});


// delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const deleteReview = await Review.findByPk(reviewId);
    const userId = req.user.id;

    if (!deleteReview) {
        return res
            .status(404)
            .json({
                message: "Review couldn't be found",
                statusCode: res.statusCode
            });
    };

    if (deleteReview.userId === userId) {
        deleteReview.destroy();
        return res.json({
            message: "Successfully deleted",
            statusCode: 200
        });
    } else {
        return res.json({
            message: "You are not the owner of this Review",
        })
    }
});

module.exports = router;