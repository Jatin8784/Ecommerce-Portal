import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteReview, postReview } from "../../store/slices/productSlice.js";
import { Star } from "lucide-react";

const ReviewsContainer = ({ product, productReviews }) => {
  const { authUser } = useSelector((state) => state.auth);
  const { isReviewDeleting, isPostingReview } = useSelector(
    (state) => state.product
  );

  const dispatch = useDispatch();

  const [rating, setRating] = useState(1);
  const [comment, setComment] = useState("");

  const handleReview = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("rating", rating);
    data.append("comment", comment);
    dispatch(postReview({ productId: product.id, review: data }));
  };

  return (
    <>
      {authUser && (
        <form onSubmit={handleReview} className="mb-8 space-y-2">
          <h4 className="text-lg font-semibold">Leave a Review</h4>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`text-2xl ${
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  ☆
                </button>
              );
            })}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Write your review..."
            className="w-full p-3 rounded-md border-border bg-background text-foreground"
          ></textarea>
          <button
            type="submit"
            disabled={isPostingReview}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:glow-on-hover animate-smooth disabled:opacity-50"
          >
            {isPostingReview ? "Submitting..." : "Submit Review "}
          </button>
        </form>
      )}

      <h3 className="text-xl font-semibold text-foreground mb-6">
        Customer Review
      </h3>
      {productReviews && productReviews.length > 0 ? (
        <div className="space-y-6">
          {productReviews.map((review) => {
            return (
              <div key={review.review_id} className="glass-card p-4 sm:p-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-4 sm:block">
                    <img
                      src={review.reviewer?.avatar?.url || "/avatar-holder.avif"}
                      alt={review?.reviewer?.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-primary/20 p-1"
                    />
                    <div className="sm:hidden">
                      <h4 className="font-semibold text-foreground text-base">
                        {review?.reviewer?.name}
                      </h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < Math.floor(review.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="hidden sm:flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground text-lg">
                        {review?.reviewer?.name}
                      </h4>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(review.rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed break-words">
                      {review.comment}
                    </p>
                    
                    {authUser?.id === review.reviewer?.id && (
                      <div className="mt-4 flex justify-end">
                        <button
                          onClick={() =>
                            dispatch(
                              deleteReview({
                                productId: product.id,
                                reviewId: review.review_id,
                              })
                            )
                          }
                          disabled={isReviewDeleting}
                          className="flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border border-destructive/30 text-destructive hover:bg-destructive hover:text-white disabled:opacity-50"
                        >
                          {isReviewDeleting ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : null}
                          <span>{isReviewDeleting ? "Deleting..." : "Delete Review"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-muted-foreground">
          No reviews yet. Be the first one to review this product.
        </p>
      )}
    </>
  );
};

export default ReviewsContainer;
