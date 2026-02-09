from pymongo import MongoClient
from datetime import datetime
from bson.objectid import ObjectId

try:
    client = MongoClient("mongodb://localhost:27017/")
    db = client["fakenews_db"]
    feedback_collection = db["feedback"]
    # Test connection
    client.admin.command('ismaster')
    print("✓ MongoDB connected for feedback")
except Exception as e:
    print(f"Warning: MongoDB connection failed: {e}")
    feedback_collection = None

def save_feedback(data):
    """
    Save user feedback about an analysis result
    
    Args:
        data dict: {
            'claim': str,
            'user_verdict': 'REAL' or 'FAKE',
            'analysis_verdict': str,
            'confidence': float,
            'comment': str,
            'helpful': bool
        }
    """
    if feedback_collection is None:
        return {"status": "error", "message": "Database not connected"}
    
    try:
        feedback_record = {
            **data,
            "timestamp": datetime.now(),
            "status": "received"
        }
        result = feedback_collection.insert_one(feedback_record)
        return {
            "status": "success",
            "feedback_id": str(result.inserted_id),
            "message": "Feedback saved successfully"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_feedback(claim=None, limit=10):
    """
    Get feedback records
    
    Args:
        claim (str): Optional claim to filter by
        limit (int): Maximum number of records to return
    """
    if feedback_collection is None:
        return []
    
    try:
        query = {}
        if claim:
            query['claim'] = claim
        
        results = list(feedback_collection.find(query).limit(limit).sort("timestamp", -1))
        # Convert ObjectId to string for JSON serialization
        for result in results:
            result['_id'] = str(result['_id'])
        return results
    except Exception as e:
        print(f"Error retrieving feedback: {e}")
        return []

def get_feedback_stats():
    """Get feedback statistics"""
    if feedback_collection is None:
        return {}
    
    try:
        total = feedback_collection.count_documents({})
        helpful = feedback_collection.count_documents({"helpful": True})
        unhelpful = feedback_collection.count_documents({"helpful": False})
        
        return {
            "total_feedback": total,
            "helpful": helpful,
            "unhelpful": unhelpful,
            "usefulness_ratio": (helpful / total * 100) if total > 0 else 0
        }
    except Exception as e:
        print(f"Error getting feedback stats: {e}")
        return {}

def update_feedback(feedback_id, updates):
    """Update a feedback record"""
    if feedback_collection is None:
        return {"status": "error", "message": "Database not connected"}
    
    try:
        result = feedback_collection.update_one(
            {"_id": ObjectId(feedback_id)},
            {"$set": updates}
        )
        if result.modified_count > 0:
            return {"status": "success", "message": "Feedback updated"}
        else:
            return {"status": "error", "message": "Feedback not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def delete_feedback(feedback_id):
    """Delete a feedback record"""
    if feedback_collection is None:
        return {"status": "error", "message": "Database not connected"}
    
    try:
        result = feedback_collection.delete_one({"_id": ObjectId(feedback_id)})
        if result.deleted_count > 0:
            return {"status": "success", "message": "Feedback deleted"}
        else:
            return {"status": "error", "message": "Feedback not found"}
    except Exception as e:
        return {"status": "error", "message": str(e)}