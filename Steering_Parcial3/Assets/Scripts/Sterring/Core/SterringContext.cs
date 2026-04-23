using UnityEngine;

public struct SterringContext
{
    public Vector2 position;
    public Vector2 velocity;
    public float maxSpeed;
    public float maxForce;
    
    public SterringContext(Vector2 pos, Vector2 vel, float spd, float frc)
    {
        position = pos;
        velocity = vel;
        maxSpeed = spd;
        maxForce = frc;
    }
}
